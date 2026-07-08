import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const args = new Map(process.argv.slice(2).map((arg) => { const [k, v = "true"] = arg.replace(/^--/, "").split("="); return [k, v]; }));
const query = args.get("query") || "(set:spm or set:tspm or set:fin or set:tfin) include:extras";
const limit = args.has("limit") ? Number(args.get("limit")) : null;

function norm(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function image(card, key) {
  if (card.image_uris?.[key]) return card.image_uris[key];
  for (const face of card.card_faces || []) if (face.image_uris?.[key]) return face.image_uris[key];
  return null;
}
function parentSetCode(code) {
  const value = String(code || "").toLowerCase();
  if (value.startsWith("t") && value.length > 1) return value.slice(1);
  return value;
}
function isTokenCard(card) {
  return String(card.layout || "").includes("token") || String(card.type_line || "").toLowerCase().includes("token") || String(card.set_type || "").includes("token") || String(card.set || "").toLowerCase().startsWith("t");
}
function finishLabel(finish) {
  const labels = {
    nonfoil: "Nonfoil",
    foil: "Traditional Foil",
    etched: "Etched Foil",
    glossy: "Glossy",
  };
  return labels[finish] || String(finish || "Finish").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
}
function variantLabel(card) {
  const labels = [];
  if (card.full_art) labels.push("Full Art");
  if (card.border_color === "borderless") labels.push("Borderless");
  if (card.promo) labels.push("Promo");
  if (card.textless) labels.push("Textless");
  if (card.variation) labels.push("Variation");
  for (const item of card.frame_effects || []) labels.push(String(item).replace(/_/g, " "));
  for (const item of card.promo_types || []) labels.push(String(item).replace(/_/g, " "));
  return [...new Set(labels.map((x) => x.replace(/^./, (c) => c.toUpperCase())))].join(" • ") || "Standard";
}
function priceForFinish(card, finish) {
  if (finish === "foil") return card.prices?.usd_foil || card.prices?.usd || null;
  if (finish === "etched") return card.prices?.usd_etched || card.prices?.usd_foil || card.prices?.usd || null;
  return card.prices?.usd || null;
}
async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "TrackerUnlimited/0.1", "Accept": "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}
async function importSet(code) {
  const set = await fetchJson(`https://api.scryfall.com/sets/${encodeURIComponent(code)}`);
  await supabase.from("mtg_sets").upsert({
    id: set.id, code: set.code, name: set.name, set_type: set.set_type,
    released_at: set.released_at, card_count: set.card_count, icon_svg_uri: set.icon_svg_uri,
    scryfall_uri: set.scryfall_uri, raw: set, updated_at: new Date().toISOString()
  }, { onConflict: "id" }).throwOnError();
  return set;
}
async function importCard(card) {
  const set = await importSet(card.set);
  await supabase.from("mtg_cards").upsert({
    id: card.oracle_id || card.id, oracle_id: card.oracle_id, name: card.name, normalized_name: norm(card.name),
    mana_cost: card.mana_cost, cmc: card.cmc, type_line: card.type_line, oracle_text: card.oracle_text,
    power: card.power, toughness: card.toughness, loyalty: card.loyalty, defense: card.defense,
    colors: card.colors || [], color_identity: card.color_identity || [], keywords: card.keywords || [],
    legalities: card.legalities || {}, reserved: Boolean(card.reserved), raw: card, updated_at: new Date().toISOString()
  }, { onConflict: "id" }).throwOnError();

  const finishes = Array.isArray(card.finishes) && card.finishes.length ? card.finishes : [card.foil ? "foil" : "nonfoil"];
  const parentCode = parentSetCode(card.set);
  const token = isTokenCard(card);

  for (const finish of finishes) {
    const id = `${card.id}::${finish}`;
    await supabase.from("mtg_printings").upsert({
      id, base_scryfall_id: card.id, card_id: card.oracle_id || card.id, oracle_id: card.oracle_id, set_id: set.id, set_code: parentCode, parent_set_code: parentCode,
      collector_number: card.collector_number, lang: card.lang, layout: card.layout, rarity: card.rarity,
      released_at: card.released_at, finishes: card.finishes || [], finish, finish_label: finishLabel(finish), variant_label: variantLabel(card),
      frame_effects: card.frame_effects || [], promo_types: card.promo_types || [],
      border_color: card.border_color, security_stamp: card.security_stamp, digital: Boolean(card.digital),
      foil: finish === "foil", nonfoil: finish === "nonfoil", oversized: Boolean(card.oversized), variation: Boolean(card.variation), booster: Boolean(card.booster),
      is_token: token, is_extra: token || Boolean(card.is_extra) || Boolean(card.extra),
      image_small: image(card, "small"), image_normal: image(card, "normal"), image_large: image(card, "large"), image_png: image(card, "png"), image_art_crop: image(card, "art_crop"), image_border_crop: image(card, "border_crop"),
      price_usd: priceForFinish(card, finish), price_usd_foil: card.prices?.usd_foil || null, price_usd_etched: card.prices?.usd_etched || null, price_eur: card.prices?.eur || null, price_tix: card.prices?.tix || null,
      purchase_uris: card.purchase_uris || {}, raw: card, updated_at: new Date().toISOString()
    }, { onConflict: "id" }).throwOnError();
  }
}
async function main() {
  let url = `https://api.scryfall.com/cards/search?unique=prints&order=set&q=${encodeURIComponent(query)}`;
  let imported = 0;
  while (url) {
    const page = await fetchJson(url);
    for (const card of page.data || []) {
      await importCard(card);
      imported += 1;
      if (imported % 25 === 0) console.log(`Imported ${imported}`);
      if (limit && imported >= limit) { console.log(JSON.stringify({ ok: true, imported, stoppedAtLimit: limit, query }, null, 2)); return; }
    }
    url = page.has_more ? page.next_page : null;
    if (url) await sleep(90);
  }
  console.log(JSON.stringify({ ok: true, imported, query }, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
