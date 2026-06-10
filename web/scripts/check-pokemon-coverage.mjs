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

async function count(table) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

async function main() {
  const [sets, cards, prints] = await Promise.all([
    count("pokemon_sets"),
    count("pokemon_cards"),
    count("pokemon_prints"),
  ]);

  const { data: cardsWithDex, error: dexError } = await supabase
    .from("pokemon_cards")
    .select("dex_ids")
    .not("dex_ids", "eq", "{}");

  if (dexError) throw dexError;

  const dex = new Set();
  for (const row of cardsWithDex || []) {
    for (const id of row.dex_ids || []) dex.add(Number(id));
  }

  const missing = [];
  for (let i = 1; i <= 1025; i++) {
    if (!dex.has(i)) missing.push(i);
  }

  const { count: pricedPrints, error: priceError } = await supabase
    .from("pokemon_prints")
    .select("*", { count: "exact", head: true })
    .not("price_market", "is", null);

  if (priceError) throw priceError;

  console.log(JSON.stringify({
    sets,
    cards,
    prints,
    distinctPokemonWithCards: dex.size,
    missingNationalDexNumbers: missing,
    pricedPrints: pricedPrints || 0,
    unpricedPrints: prints - (pricedPrints || 0),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
