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

async function main() {
  const [{ count: prints }, { count: priced }] = await Promise.all([
    supabase.from("pokemon_prints").select("*", { count: "exact", head: true }),
    supabase.from("pokemon_prints").select("*", { count: "exact", head: true }).not("price_market", "is", null),
  ]);

  const { data: sample } = await supabase
    .from("pokemon_prints")
    .select("print_name, price_low, price_mid, price_high, price_market, price_currency, pokemon_cards(name), pokemon_sets(name)")
    .not("price_market", "is", null)
    .order("price_market", { ascending: false })
    .limit(20);

  console.log(JSON.stringify({
    totalPrints: prints || 0,
    pricedPrints: priced || 0,
    unpricedPrints: (prints || 0) - (priced || 0),
    topPricedSample: sample || [],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
