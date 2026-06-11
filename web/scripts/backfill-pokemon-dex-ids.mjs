import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
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

const dryRun = args.has("dry-run");
const limit = args.has("limit") ? Number(args.get("limit")) : null;
const batchSize = args.has("batch") ? Math.max(1, Number(args.get("batch"))) : 500;

const manualAliases = new Map([
  ["nidoran f", 29],
  ["nidoran female", 29],
  ["nidoran", 29],
  ["nidoran m", 32],
  ["nidoran male", 32],
  ["farfetchd", 83],
  ["farfetch d", 83],
  ["sirfetchd", 865],
  ["sirfetch d", 865],
  ["mr mime", 122],
  ["mime jr", 439],
  ["type null", 772],
  ["jangmo o", 782],
  ["hakamo o", 783],
  ["kommo o", 784],
  ["flabebe", 669],
  ["wo chien", 1001],
  ["chien pao", 1002],
  ["ting lu", 1003],
  ["chi yu", 1004],
  ["great tusk", 984],
  ["scream tail", 985],
  ["brute bonnet", 986],
  ["flutter mane", 987],
  ["slither wing", 988],
  ["sandy shocks", 989],
  ["iron treads", 990],
  ["iron bundle", 991],
  ["iron hands", 992],
  ["iron jugulis", 993],
  ["iron moth", 994],
  ["iron thorns", 995],
  ["roaring moon", 1005],
  ["iron valiant", 1006],
  ["walking wake", 1009],
  ["iron leaves", 1010],
  ["gouging fire", 1020],
  ["raging bolt", 1021],
  ["iron boulder", 1022],
  ["iron crown", 1023],
]);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/♀/g, " female ")
    .replace(/♂/g, " male ")
    .replace(/['’.:]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bex\b|\bgx\b|\bvmax\b|\bvstar\b|\bv union\b|\bv\b|\bmega\b|\bm\b/g, " ")
    .replace(/\bdelta\b|\bprime\b|\bbreak\b|\blv x\b|\blegend\b|\btag team\b/g, " ")
    .replace(/\bteam rockets\b|\bteam rocket\b|\berikas\b|\bbrocks\b|\bmistys\b|\blt surges\b|\bsurges\b|\bsabrinas\b|\bblaines\b|\bgiovannis\b|\bkogas\b|\bbrunos\b|\bkarens\b|\blances\b|\bcynthias\b|\bclairs\b|\bashs\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameVariants(name) {
  const normalized = normalizeText(name);
  const variants = new Set([normalized]);

  variants.add(normalized.replace(/\bmr mime\b/g, "mrmime"));
  variants.add(normalized.replace(/\bmime jr\b/g, "mimejr"));
  variants.add(normalized.replace(/\bfarfetch d\b/g, "farfetchd"));
  variants.add(normalized.replace(/\bsirfetch d\b/g, "sirfetchd"));
  variants.add(normalized.replace(/\bnidoran female\b/g, "nidoran f"));
  variants.add(normalized.replace(/\bnidoran male\b/g, "nidoran m"));

  return Array.from(variants).filter(Boolean);
}

async function fetchSpeciesMap() {
  console.log("Fetching Pokémon species list from PokéAPI...");
  const response = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=2000");

  if (!response.ok) {
    throw new Error(`PokéAPI species request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const species = [];

  for (const item of data.results || []) {
    const match = String(item.url || "").match(/\/pokemon-species\/(\d+)\//);
    const dex = match ? Number(match[1]) : null;
    if (!dex || dex > 1025) continue;

    const rawName = String(item.name || "").replace(/-/g, " ");
    species.push({
      dex,
      rawName,
      names: nameVariants(rawName),
    });
  }

  for (const [alias, dex] of manualAliases.entries()) {
    const target = species.find((item) => item.dex === dex);
    if (target) target.names.push(normalizeText(alias));
    else species.push({ dex, rawName: alias, names: [normalizeText(alias)] });
  }

  species.sort((a, b) => {
    const longestA = Math.max(...a.names.map((name) => name.length));
    const longestB = Math.max(...b.names.map((name) => name.length));
    return longestB - longestA;
  });

  console.log(`Loaded ${species.length} species aliases.`);
  return species;
}

function matchSpecies(cardName, species) {
  const normalized = ` ${normalizeText(cardName)} `;

  for (const entry of species) {
    for (const name of entry.names) {
      if (!name) continue;
      const needle = ` ${name} `;
      if (normalized.includes(needle)) return entry;
    }
  }

  return null;
}

async function getCardsToBackfill() {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("pokemon_cards")
      .select("id, name, dex_ids")
      .or("dex_ids.is.null,dex_ids.eq.{}")
      .range(from, to);

    if (error) throw error;
    if (!data?.length) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
    if (limit && rows.length >= limit) return rows.slice(0, limit);
  }

  return limit ? rows.slice(0, limit) : rows;
}

async function updateInChunks(rows) {
  if (dryRun || rows.length === 0) return;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);

    const { error } = await supabase
      .from("pokemon_cards")
      .upsert(chunk, { onConflict: "id" });

    if (error) throw error;
  }
}

async function main() {
  const species = await fetchSpeciesMap();
  const cards = await getCardsToBackfill();

  console.log(`Cards needing dex backfill: ${cards.length}`);

  const updates = [];
  const unmatched = [];

  for (const card of cards) {
    const match = matchSpecies(card.name, species);

    if (!match) {
      unmatched.push(card.name);
      continue;
    }

    updates.push({
      id: card.id,
      name: card.name,
      dex_ids: [match.dex],
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`Matched: ${updates.length}`);
  console.log(`Unmatched: ${unmatched.length}`);

  if (unmatched.length) {
    console.log("Unmatched sample:");
    console.log([...new Set(unmatched)].slice(0, 80));
  }

  if (dryRun) {
    console.log("Dry run only. No database changes made.");
    console.log("Matched sample:");
    console.log(updates.slice(0, 20));
    return;
  }

  await updateInChunks(updates);
  console.log("Dex ID backfill complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
