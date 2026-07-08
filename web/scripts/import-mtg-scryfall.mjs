import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));

const reset = args.has("reset");
const freshDownload = args.has("fresh") || reset;
const limit = args.has("limit") ? Number(args.get("limit")) : null;
const batchSize = args.has("batch") ? Math.max(25, Number(args.get("batch"))) : 500;
const progressPath = path.join(process.cwd(), ".mtg-full-import-progress.json");
const bulkPath = path.join(process.cwd(), ".mtg-scryfall-all-cards.json");

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function image(card, key) {
  if (card.image_uris?.[key]) return card.image_uris[key];
  for (const face of card.card_faces || []) {
    if (face.image_uris?.[key]) return face.image_uris[key];
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempts = 4) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "TrackerUnlimited/0.1",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(800 * attempt);
    }
  }

  throw lastError;
}

async function importSets() {
  const data = await fetchJson("https://api.scryfall.com/sets");
  const rows = (data.data || []).map((set) => ({
    id: set.id,
    code: set.code,
    name: set.name,
    set_type: set.set_type,
    released_at: set.released_at,
    card_count: set.card_count,
    icon_svg_uri: set.icon_svg_uri,
    scryfall_uri: set.scryfall_uri,
    raw: set,
    updated_at: new Date().toISOString(),
  }));

  await upsertRows("mtg_sets", rows, "id");
  console.log(`Imported/updated ${rows.length} MTG sets.`);
}

async function getBulkDownloadUri() {
  const data = await fetchJson("https://api.scryfall.com/bulk-data");
  const bulk = (data.data || []).find((item) => item.type === "all_cards");
  if (!bulk?.download_uri) throw new Error("Could not find Scryfall all_cards bulk download.");
  console.log(`Using Scryfall all_cards bulk data from ${bulk.updated_at}.`);
  return bulk.download_uri;
}

async function downloadBulkFile() {
  if (!freshDownload && fs.existsSync(bulkPath) && fs.statSync(bulkPath).size > 0) {
    console.log(`Using cached bulk file: ${bulkPath}`);
    return;
  }

  const uri = await getBulkDownloadUri();
  console.log("Downloading Scryfall all_cards bulk data...");

  const res = await fetch(uri, { headers: { "User-Agent": "TrackerUnlimited/0.1" } });
  if (!res.ok || !res.body) throw new Error(`Bulk download failed: ${res.status} ${res.statusText}`);

  const tempPath = `${bulkPath}.download`;
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tempPath));
  fs.renameSync(tempPath, bulkPath);
  console.log(`Downloaded bulk file: ${bulkPath}`);
}

function loadProgress() {
  if (reset && fs.existsSync(progressPath)) fs.unlinkSync(progressPath);
  if (!fs.existsSync(progressPath)) return { processed: 0, importedCollectibles: 0 };

  try {
    return JSON.parse(fs.readFileSync(progressPath, "utf8"));
  } catch {
    return { processed: 0, importedCollectibles: 0 };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

async function upsertRows(table, rows, onConflict) {
  if (!rows.length) return;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

function typeForCard(card) {
  const typeLine = String(card.type_line || "").toLowerCase();
  if (typeLine.includes("token")) return "token";
  if (card.layout === "emblem" || typeLine.includes("emblem")) return "emblem";
  if (typeLine.includes("card")) return "insert";
  if (card.digital) return "digital";
  return "card";
}

function variantParts(card) {
  const parts = [];

  if (card.full_art) parts.push("Full Art");
  if (card.textless) parts.push("Textless");
  if (card.variation) parts.push("Variant");
  if (card.promo) parts.push("Promo");
  if (card.oversized) parts.push("Oversized");
  if (card.digital) parts.push("Digital");
  if (card.border_color && card.border_color !== "black") parts.push(`${title(card.border_color)} Border`);
  if (card.security_stamp) parts.push(`${title(card.security_stamp)} Stamp`);
  if (Array.isArray(card.frame_effects)) parts.push(...card.frame_effects.map((item) => title(item.replaceAll("_", " "))));
  if (Array.isArray(card.promo_types)) parts.push(...card.promo_types.map((item) => title(item.replaceAll("_", " "))));

  const unique = [...new Set(parts.filter(Boolean))];
  return unique.length ? unique.join(" • ") : "Standard";
}

function title(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function finishLabel(finish) {
  if (finish === "nonfoil") return "Nonfoil";
  if (finish === "foil") return "Traditional Foil";
  if (finish === "etched") return "Etched Foil";
  return title(finish);
}

function priceForFinish(card, finish) {
  if (finish === "foil") return card.prices?.usd_foil || null;
  if (finish === "etched") return card.prices?.usd_etched || null;
  return card.prices?.usd || null;
}

function eurForFinish(card, finish) {
  if (finish === "foil") return card.prices?.eur_foil || card.prices?.eur || null;
  return card.prices?.eur || null;
}

function availableFinishes(card) {
  const finishes = Array.isArray(card.finishes) ? card.finishes : [];
  if (finishes.length) return finishes;

  const fallback = [];
  if (card.nonfoil) fallback.push("nonfoil");
  if (card.foil) fallback.push("foil");
  if (card.prices?.usd_etched) fallback.push("etched");
  return fallback.length ? fallback : ["nonfoil"];
}

function buildRows(card) {
  const cardId = card.oracle_id || `scryfall-${card.id}`;
  const collectibleType = typeForCard(card);
  const variantLabel = variantParts(card);

  const cardRow = {
    id: cardId,
    oracle_id: card.oracle_id || null,
    name: card.name,
    normalized_name: norm(card.name),
    mana_cost: card.mana_cost || card.card_faces?.[0]?.mana_cost || null,
    cmc: card.cmc,
    type_line: card.type_line || card.card_faces?.map((face) => face.type_line).filter(Boolean).join(" // ") || null,
    oracle_text: card.oracle_text || card.card_faces?.map((face) => face.oracle_text).filter(Boolean).join("\n//\n") || null,
    power: card.power || null,
    toughness: card.toughness || null,
    loyalty: card.loyalty || null,
    defense: card.defense || null,
    colors: card.colors || [],
    color_identity: card.color_identity || [],
    keywords: card.keywords || [],
    legalities: card.legalities || {},
    reserved: Boolean(card.reserved),
    raw: card,
    updated_at: new Date().toISOString(),
  };

  const printRows = availableFinishes(card).map((finish) => {
    const label = finishLabel(finish);
    const displayName = `${card.name} — ${variantLabel} (${label})`;

    return {
      id: `${card.id}::${finish}`,
      scryfall_id: card.id,
      card_id: cardId,
      oracle_id: card.oracle_id || null,
      set_id: card.set_id || null,
      set_code: card.set,
      collector_number: card.collector_number,
      lang: card.lang,
      layout: card.layout,
      rarity: card.rarity,
      released_at: card.released_at,
      finishes: card.finishes || [],
      finish,
      finish_label: label,
      variant_label: variantLabel,
      full_name: displayName,
      display_name: displayName,
      collectible_type: collectibleType,
      is_token: collectibleType === "token" || collectibleType === "emblem",
      is_extra: Boolean(card.oversized || card.digital || collectibleType !== "card"),
      frame_effects: card.frame_effects || [],
      promo_types: card.promo_types || [],
      border_color: card.border_color,
      security_stamp: card.security_stamp,
      digital: Boolean(card.digital),
      foil: finish === "foil",
      nonfoil: finish === "nonfoil",
      oversized: Boolean(card.oversized),
      variation: Boolean(card.variation),
      booster: Boolean(card.booster),
      image_small: image(card, "small"),
      image_normal: image(card, "normal"),
      image_large: image(card, "large"),
      image_png: image(card, "png"),
      image_art_crop: image(card, "art_crop"),
      image_border_crop: image(card, "border_crop"),
      price_usd: priceForFinish(card, finish),
      price_usd_foil: card.prices?.usd_foil || null,
      price_usd_etched: card.prices?.usd_etched || null,
      price_eur: eurForFinish(card, finish),
      price_tix: card.prices?.tix || null,
      purchase_uris: card.purchase_uris || {},
      raw: card,
      updated_at: new Date().toISOString(),
    };
  });

  return { cardRow, printRows };
}

async function resetMtgData() {
  console.log("Resetting MTG cards, printings, and MTG collection entries...");
  await supabase.from("mtg_collection_entries").delete().neq("id", -1).throwOnError();
  await supabase.from("mtg_wishlist_entries").delete().neq("id", -1).throwOnError();
  await supabase.from("mtg_printings").delete().neq("id", "").throwOnError();
  await supabase.from("mtg_cards").delete().neq("id", "").throwOnError();
}

function parseJsonArrayFile(filePath, onObject) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8", highWaterMark: 1024 * 1024 });
    let started = false;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let buffer = "";
    let count = 0;
    let chain = Promise.resolve();

    stream.on("data", (chunk) => {
      stream.pause();

      for (let i = 0; i < chunk.length; i += 1) {
        const char = chunk[i];

        if (!started) {
          if (char === "{") {
            started = true;
            depth = 1;
            buffer = "{";
          }
          continue;
        }

        buffer += char;

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (inString) continue;

        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;

        if (started && depth === 0) {
          const raw = buffer;
          buffer = "";
          started = false;
          count += 1;
          chain = chain.then(() => onObject(JSON.parse(raw), count));
        }
      }

      chain.then(() => stream.resume()).catch((error) => {
        stream.destroy(error);
      });
    });

    stream.on("error", reject);
    stream.on("end", () => chain.then(() => resolve(count)).catch(reject));
  });
}

async function main() {
  await importSets();
  await downloadBulkFile();

  if (reset) await resetMtgData();

  const progress = loadProgress();
  let processed = Number(progress.processed || 0);
  let importedCollectibles = Number(progress.importedCollectibles || 0);
  let skipped = 0;
  let pendingCards = new Map();
  let pendingPrintings = [];

  async function flush() {
    if (!pendingCards.size && !pendingPrintings.length) return;
    await upsertRows("mtg_cards", [...pendingCards.values()], "id");
    await upsertRows("mtg_printings", pendingPrintings, "id");
    pendingCards = new Map();
    pendingPrintings = [];
    saveProgress({ processed, importedCollectibles, updatedAt: new Date().toISOString() });
  }

  await parseJsonArrayFile(bulkPath, async (card, index) => {
    if (!reset && index <= processed) {
      skipped += 1;
      return;
    }

    const { cardRow, printRows } = buildRows(card);
    pendingCards.set(cardRow.id, cardRow);
    pendingPrintings.push(...printRows);
    processed = index;
    importedCollectibles += printRows.length;

    if (pendingPrintings.length >= batchSize) await flush();

    if (processed % 1000 === 0) {
      console.log(`Processed ${processed} Scryfall objects • ${importedCollectibles} collectible printings imported${skipped ? ` • ${skipped} skipped` : ""}`);
    }

    if (limit && processed >= limit) {
      await flush();
      console.log(JSON.stringify({ ok: true, stoppedAtLimit: limit, processed, importedCollectibles }, null, 2));
      process.exit(0);
    }
  });

  await flush();
  console.log(JSON.stringify({ ok: true, processed, importedCollectibles }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
