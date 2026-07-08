import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const query = args.get("query") || null;
const limit = args.has("limit") ? Number(args.get("limit")) : null;
const reset = args.has("reset");
const offsetArg = args.has("offset") ? Number(args.get("offset")) : null;
const batchSize = args.has("batch") ? Math.max(25, Number(args.get("batch"))) : 500;
const progressPath = path.join(process.cwd(), ".mtg-scryfall-full-import-progress.json");

if (reset && fs.existsSync(progressPath)) fs.unlinkSync(progressPath);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "TrackerUnlimited/0.1",
          Accept: "application/json",
          ...(options.headers || {}),
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
      return response;
    } catch (error) {
      lastError = error;
      const wait = 750 * attempt;
      console.warn(`Fetch failed (${attempt}/${attempts}). Retrying in ${wait}ms: ${error.message}`);
      await sleep(wait);
    }
  }
  throw lastError;
}

async function fetchJson(url, attempts = 5) {
  const response = await fetchWithRetry(url, {}, attempts);
  return response.json();
}

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

function parentSetCode(code) {
  const value = String(code || "").toLowerCase();
  if (value.startsWith("t") && value.length > 1) return value.slice(1);
  return value;
}

function isTokenCard(card) {
  const layout = String(card.layout || "").toLowerCase();
  const typeLine = String(card.type_line || "").toLowerCase();
  const setType = String(card.set_type || "").toLowerCase();
  const setCode = String(card.set || "").toLowerCase();
  return layout.includes("token") || typeLine.includes("token") || setType.includes("token") || setCode.startsWith("t");
}

function finishLabel(finish) {
  const labels = {
    nonfoil: "Nonfoil",
    foil: "Traditional Foil",
    etched: "Etched Foil",
    glossy: "Glossy",
  };
  return labels[finish] || String(finish || "Finish").replace(/[-_]/g, " ").replace(/^./, (char) => char.toUpperCase());
}

function titleize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function variantLabel(card) {
  const labels = [];

  if (card.full_art) labels.push("Full Art");
  if (card.textless) labels.push("Textless");
  if (card.promo) labels.push("Promo");
  if (card.variation) labels.push("Variation");
  if (card.digital) labels.push("Digital");
  if (isTokenCard(card)) labels.push("Token/Extra");
  if (card.border_color === "borderless") labels.push("Borderless");
  if (card.oversized) labels.push("Oversized");

  for (const item of card.frame_effects || []) labels.push(titleize(item));
  for (const item of card.promo_types || []) labels.push(titleize(item));

  return [...new Set(labels)].join(" • ") || "Standard";
}

function priceForFinish(card, finish) {
  if (finish === "foil") return card.prices?.usd_foil || card.prices?.usd || null;
  if (finish === "etched") return card.prices?.usd_etched || card.prices?.usd_foil || card.prices?.usd || null;
  return card.prices?.usd || null;
}

function finishesFor(card) {
  if (Array.isArray(card.finishes) && card.finishes.length) return card.finishes;
  const finishes = [];
  if (card.nonfoil) finishes.push("nonfoil");
  if (card.foil) finishes.push("foil");
  if (card.prices?.usd_etched) finishes.push("etched");
  return finishes.length ? finishes : ["nonfoil"];
}

function loadProgress() {
  if (offsetArg !== null && Number.isFinite(offsetArg)) return { index: offsetArg };
  if (!fs.existsSync(progressPath)) return { index: 0 };
  try {
    return JSON.parse(fs.readFileSync(progressPath, "utf8"));
  } catch {
    return { index: 0 };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

async function upsert(table, rows, onConflict) {
  if (!rows.length) return;
  for (let index = 0; index < rows.length; index += batchSize) {
    const chunk = rows.slice(index, index + batchSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

async function importAllSets() {
  const data = await fetchJson("https://api.scryfall.com/sets");
  const rows = (data.data || []).map((set) => ({
    id: set.id,
    code: set.code,
    name: set.name,
    set_type: set.set_type,
    released_at: set.released_at || null,
    card_count: set.card_count || 0,
    icon_svg_uri: set.icon_svg_uri || null,
    scryfall_uri: set.scryfall_uri || null,
    raw: set,
    updated_at: new Date().toISOString(),
  }));
  await upsert("mtg_sets", rows, "id");
  console.log(`Imported/updated ${rows.length} MTG sets.`);
}

function cardRowsFrom(card) {
  return {
    id: card.oracle_id || card.id,
    oracle_id: card.oracle_id || null,
    name: card.name,
    normalized_name: norm(card.name),
    mana_cost: card.mana_cost || card.card_faces?.[0]?.mana_cost || null,
    cmc: card.cmc ?? null,
    type_line: card.type_line || null,
    oracle_text: card.oracle_text || card.card_faces?.map((face) => face.oracle_text).filter(Boolean).join("\n---\n") || null,
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
}

function printingRowsFrom(card) {
  const parentCode = parentSetCode(card.set);
  const token = isTokenCard(card);
  const variant = variantLabel(card);
  const finishes = finishesFor(card);

  return finishes.map((finish) => ({
    id: `${card.id}::${finish}`,
    base_scryfall_id: card.id,
    card_id: card.oracle_id || card.id,
    oracle_id: card.oracle_id || null,
    set_id: card.set_id || null,
    set_code: parentCode,
    parent_set_code: parentCode,
    collector_number: card.collector_number || null,
    lang: card.lang || null,
    layout: card.layout || null,
    rarity: card.rarity || null,
    released_at: card.released_at || null,
    finishes: card.finishes || finishes,
    finish,
    finish_label: finishLabel(finish),
    variant_label: variant,
    frame_effects: card.frame_effects || [],
    promo_types: card.promo_types || [],
    border_color: card.border_color || null,
    security_stamp: card.security_stamp || null,
    digital: Boolean(card.digital),
    foil: finish === "foil",
    nonfoil: finish === "nonfoil",
    oversized: Boolean(card.oversized),
    variation: Boolean(card.variation),
    booster: Boolean(card.booster),
    is_token: token,
    is_extra: token || Boolean(card.is_extra) || Boolean(card.extra) || String(card.set_type || "").toLowerCase().includes("token"),
    image_small: image(card, "small"),
    image_normal: image(card, "normal"),
    image_large: image(card, "large"),
    image_png: image(card, "png"),
    image_art_crop: image(card, "art_crop"),
    image_border_crop: image(card, "border_crop"),
    price_usd: priceForFinish(card, finish),
    price_usd_foil: card.prices?.usd_foil || null,
    price_usd_etched: card.prices?.usd_etched || null,
    price_eur: card.prices?.eur || null,
    price_tix: card.prices?.tix || null,
    purchase_uris: card.purchase_uris || {},
    raw: card,
    updated_at: new Date().toISOString(),
  }));
}

async function importCardBatch(cards, runningTotal) {
  const cardRows = [];
  const printingRows = [];

  for (const card of cards) {
    cardRows.push(cardRowsFrom(card));
    printingRows.push(...printingRowsFrom(card));
  }

  await upsert("mtg_cards", cardRows, "id");
  await upsert("mtg_printings", printingRows, "id");

  console.log(`Imported ${runningTotal} Scryfall cards (${printingRows.length} collectible finish rows in this batch).`);
}

async function fetchBulkAllCards() {
  const bulk = await fetchJson("https://api.scryfall.com/bulk-data");
  const allCards = (bulk.data || []).find((item) => item.type === "all_cards");
  if (!allCards?.download_uri) throw new Error("Could not find Scryfall all_cards bulk download URI.");

  console.log(`Downloading Scryfall all_cards bulk data from ${allCards.updated_at || "latest export"}...`);
  const response = await fetchWithRetry(allCards.download_uri, {}, 5);
  return response.json();
}

async function importFromBulk() {
  await importAllSets();

  const allCards = await fetchBulkAllCards();
  const progress = loadProgress();
  const start = Math.max(0, Number(progress.index || 0));
  const end = limit ? Math.min(allCards.length, start + limit) : allCards.length;

  console.log(`Scryfall cards in bulk file: ${allCards.length}`);
  console.log(`Starting at index ${start}; ending before ${end}.`);

  for (let index = start; index < end; index += batchSize) {
    const batch = allCards.slice(index, Math.min(index + batchSize, end));
    await importCardBatch(batch, Math.min(index + batch.length, end));
    saveProgress({ index: index + batch.length, total: allCards.length, updatedAt: new Date().toISOString() });
  }

  console.log(JSON.stringify({ ok: true, mode: "bulk-all-cards", importedRange: [start, end], totalAvailable: allCards.length }, null, 2));
}

async function importFromSearch() {
  await importAllSets();
  let url = `https://api.scryfall.com/cards/search?unique=prints&order=set&q=${encodeURIComponent(query)}`;
  let imported = 0;
  const buffer = [];

  while (url) {
    const page = await fetchJson(url);
    for (const card of page.data || []) {
      buffer.push(card);
      imported += 1;
      if (buffer.length >= batchSize) {
        await importCardBatch(buffer.splice(0), imported);
      }
      if (limit && imported >= limit) break;
    }
    if (limit && imported >= limit) break;
    url = page.has_more ? page.next_page : null;
    if (url) await sleep(90);
  }

  if (buffer.length) await importCardBatch(buffer, imported);
  console.log(JSON.stringify({ ok: true, mode: "search", imported, query }, null, 2));
}

async function main() {
  if (query) await importFromSearch();
  else await importFromBulk();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
