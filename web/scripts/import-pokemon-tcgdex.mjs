import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en";
const PROGRESS_PATH = path.join(process.cwd(), ".pokemon-import-progress.json");

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(`
Missing Supabase environment variables.

Required:
  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Add SUPABASE_SERVICE_ROLE_KEY to web/.env.local from Supabase:
Project Settings → API → service_role key

Do NOT expose the service role key publicly.
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const startOffsetArg = args.get("offset");
const startOffset = startOffsetArg !== undefined ? Number(startOffsetArg) : null;
const limitSets = args.has("limit") ? Number(args.get("limit")) : null;
const setIdOnly = args.get("set") || null;
const reset = args.has("reset");
const dryRun = args.has("dry-run");
const batchSize = args.has("batch") ? Math.max(1, Number(args.get("batch"))) : 500;
const delayMs = args.has("delay") ? Math.max(0, Number(args.get("delay"))) : 35;

if (reset && fs.existsSync(PROGRESS_PATH)) {
  fs.unlinkSync(PROGRESS_PATH);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tcgdex(pathname) {
  const response = await fetch(`${TCGDEX_BASE}${pathname}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`TCGDex ${response.status} ${response.statusText} ${pathname}\n${body}`);
  }

  return response.json();
}

function hasAssetExtension(url) {
  return /\.(webp|png|jpg|jpeg)$/i.test(url || "");
}

function cardImageUrl(image, quality = "high") {
  if (!image) return null;
  if (hasAssetExtension(image)) return image;
  return `${image}/${quality}.webp`;
}

function setAssetUrl(asset) {
  if (!asset) return null;
  if (hasAssetExtension(asset)) return asset;
  return `${asset}.webp`;
}

function asDate(value) {
  if (!value) return null;
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replaceAll("/", "-");
  return null;
}

function slugifyPokemonName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeDexIds(card) {
  const candidates = [card?.dexId, card?.dexIds, card?.dex_id, card?.dex_ids];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0);
    }

    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber > 0) return [asNumber];
  }

  return [];
}

function prettyVariantName(key) {
  const map = {
    normal: "Normal",
    holo: "Holo",
    reverse: "Reverse Holo",
    firstEdition: "1st Edition",
    wPromo: "Wizards Promo",
  };

  return (
    map[key] ||
    String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^./, (char) => char.toUpperCase())
      .trim()
  );
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function findPriceObject(card, variantKey) {
  const prices = card?.pricing || card?.prices || card?.markets || {};

  const direct = prices?.[variantKey];
  if (direct && typeof direct === "object") return direct;

  const tcg = prices?.tcgplayer?.prices || prices?.tcgplayer || {};
  const tcgVariant = tcg?.[variantKey];
  if (tcgVariant && typeof tcgVariant === "object") return tcgVariant;

  const cardmarket = prices?.cardmarket || prices?.cardMarket || {};
  const cmVariant = cardmarket?.[variantKey];
  if (cmVariant && typeof cmVariant === "object") return cmVariant;

  return {};
}

function getVariantPriceFields(card, variantKey) {
  const price = findPriceObject(card, variantKey);

  const low =
    numeric(price.low) ??
    numeric(price.lowPrice) ??
    numeric(price.min) ??
    numeric(price.trendPrice);

  const mid =
    numeric(price.mid) ??
    numeric(price.average) ??
    numeric(price.avg) ??
    numeric(price.reverseHoloTrend);

  const high =
    numeric(price.high) ??
    numeric(price.max);

  const market =
    numeric(price.market) ??
    numeric(price.marketPrice) ??
    numeric(price.trendPrice) ??
    numeric(price.averageSellPrice) ??
    numeric(price.avg30) ??
    mid ??
    low ??
    high;

  return {
    price_low: low,
    price_mid: mid,
    price_high: high,
    price_market: market,
    price_currency: price.currency || "USD",
  };
}

function extractPrintsFromCard(card) {
  const variants = card?.variants || {};
  const prints = [];

  for (const [key, value] of Object.entries(variants)) {
    const available =
      typeof value === "boolean"
        ? value
        : Boolean(value?.available ?? value?.exists ?? value);

    if (!available) continue;

    prints.push({
      print_key: key,
      print_name: prettyVariantName(key),
      is_available: true,
      raw: value,
      ...getVariantPriceFields(card, key),
    });
  }

  if (prints.length === 0) {
    prints.push({
      print_key: "standard",
      print_name: "Standard",
      is_available: true,
      raw: {},
      ...getVariantPriceFields(card, "standard"),
    });
  }

  return prints;
}

async function upsertInChunks(table, rows, onConflict) {
  if (!rows.length) return;

  if (dryRun) {
    console.log(`[dry-run] would upsert ${rows.length} rows into ${table}`);
    return;
  }

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);

    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict });

    if (error) {
      throw new Error(`${table} upsert failed: ${error.message}`);
    }
  }
}

function loadProgress() {
  if (startOffset !== null) return { offset: startOffset };
  if (!fs.existsSync(PROGRESS_PATH)) return { offset: 0 };

  try {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
  } catch {
    return { offset: 0 };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

async function importSet(setResume, setIndex, totalSets) {
  const set = await tcgdex(`/sets/${encodeURIComponent(setResume.id)}`);

  const setRow = {
    id: set.id,
    tcgdex_id: set.id,
    name: set.name,
    logo: setAssetUrl(set.logo),
    symbol: setAssetUrl(set.symbol),
    card_count_total: set.cardCount?.total || set.cardCount?.official || 0,
    card_count_official: set.cardCount?.official || 0,
    release_date: asDate(set.releaseDate),
    series_id: set.serie?.id || null,
    series_name: set.serie?.name || null,
    raw: set,
    updated_at: new Date().toISOString(),
  };

  await upsertInChunks("pokemon_sets", [setRow], "id");

  const cards = Array.isArray(set.cards) ? set.cards : [];
  const cardRows = [];
  const printRows = [];

  let cardErrors = 0;
  let withPrices = 0;

  for (const cardResume of cards) {
    try {
      const card = await tcgdex(`/cards/${encodeURIComponent(cardResume.id)}`);
      const cardImage = cardImageUrl(card.image);

      cardRows.push({
        id: card.id,
        tcgdex_id: card.id,
        set_id: set.id,
        local_id: card.localId || null,
        name: card.name,
        slug: slugifyPokemonName(card.name),
        category: card.category || null,
        illustrator: card.illustrator || null,
        rarity: card.rarity || null,
        dex_ids: normalizeDexIds(card),
        hp: card.hp ? String(card.hp) : null,
        types: Array.isArray(card.types) ? card.types : [],
        stage: card.stage || null,
        image: cardImage,
        variants: card.variants || {},
        prices: card.pricing || card.prices || card.markets || {},
        legal: card.legal || {},
        raw: card,
        updated_at: new Date().toISOString(),
      });

      const prints = extractPrintsFromCard(card);

      for (const print of prints) {
        if (print.price_market !== null && print.price_market !== undefined) withPrices += 1;

        printRows.push({
          card_id: card.id,
          set_id: set.id,
          print_key: print.print_key,
          print_name: print.print_name,
          language: "en",
          is_available: print.is_available,
          image: cardImage,
          price_low: print.price_low,
          price_mid: print.price_mid,
          price_high: print.price_high,
          price_market: print.price_market,
          price_currency: print.price_currency || "USD",
          raw: print.raw || {},
          updated_at: new Date().toISOString(),
        });
      }

      if (delayMs) await sleep(delayMs);
    } catch (error) {
      cardErrors += 1;
      console.warn(`  card failed ${cardResume.id}: ${error.message}`);
    }
  }

  await upsertInChunks("pokemon_cards", cardRows, "id");
  await upsertInChunks("pokemon_prints", printRows, "card_id,print_key,language");

  console.log(
    `[${setIndex + 1}/${totalSets}] ${set.id} ${set.name}: ${cardRows.length}/${cards.length} cards, ${printRows.length} prints, ${withPrices} priced, ${cardErrors} card errors`
  );

  return {
    setId: set.id,
    setName: set.name,
    cards: cardRows.length,
    prints: printRows.length,
    pricedPrints: withPrices,
    cardErrors,
  };
}

async function main() {
  console.log("Fetching TCGDex set list...");
  let sets = await tcgdex("/sets");

  if (setIdOnly) {
    sets = sets.filter((set) => set.id === setIdOnly);
    if (!sets.length) sets = [{ id: setIdOnly, name: setIdOnly }];
  }

  const progress = loadProgress();
  const offset = Math.max(0, Number(progress.offset || 0));
  const end = limitSets ? Math.min(sets.length, offset + limitSets) : sets.length;

  console.log(`Import mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Sets: ${sets.length}; starting at ${offset}; ending before ${end}`);
  console.log(`Batch size: ${batchSize}; delay per card: ${delayMs}ms`);

  const totals = { sets: 0, cards: 0, prints: 0, pricedPrints: 0, cardErrors: 0 };

  for (let index = offset; index < end; index++) {
    const result = await importSet(sets[index], index, sets.length);

    totals.sets += 1;
    totals.cards += result.cards;
    totals.prints += result.prints;
    totals.pricedPrints += result.pricedPrints;
    totals.cardErrors += result.cardErrors;

    saveProgress({
      offset: index + 1,
      totalSets: sets.length,
      lastSet: result.setId,
      updatedAt: new Date().toISOString(),
      totals,
    });
  }

  console.log("\nImport finished.");
  console.log(JSON.stringify(totals, null, 2));
  console.log(`Progress saved to ${PROGRESS_PATH}`);
}

main().catch((error) => {
  console.error("\nImport failed:");
  console.error(error);
  process.exit(1);
});
