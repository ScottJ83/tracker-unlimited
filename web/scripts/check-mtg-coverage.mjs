import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function count(table, build) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function main() {
  const [sets, cards, printings, tokens, extras, nonfoil, foil, etched, priced] = await Promise.all([
    count("mtg_sets"),
    count("mtg_cards"),
    count("mtg_printings"),
    count("mtg_printings", (q) => q.eq("collectible_type", "token")),
    count("mtg_printings", (q) => q.neq("collectible_type", "card")),
    count("mtg_printings", (q) => q.eq("finish", "nonfoil")),
    count("mtg_printings", (q) => q.eq("finish", "foil")),
    count("mtg_printings", (q) => q.eq("finish", "etched")),
    count("mtg_printings", (q) => q.not("price_usd", "is", null)),
  ]);

  const { data: spiderManTokenSample } = await supabase
    .from("mtg_printings")
    .select("id, display_name, set_code, collector_number, finish_label, collectible_type")
    .eq("set_code", "tspm")
    .in("collector_number", ["4", "7", "0004", "0007"])
    .limit(20);

  console.log(JSON.stringify({
    sets,
    cards,
    printings,
    tokenPrintings: tokens,
    extraPrintings: extras,
    nonfoilPrintings: nonfoil,
    foilPrintings: foil,
    etchedPrintings: etched,
    pricedPrintings: priced,
    spiderManTokenSample: spiderManTokenSample || [],
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
