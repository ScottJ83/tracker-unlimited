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
async function count(table, build) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}
async function main() {
  const [sets, cards, printings, finishPrintings, tokens, pricedPrintings] = await Promise.all([
    count("mtg_sets"),
    count("mtg_cards"),
    count("mtg_printings"),
    count("mtg_printings", (q) => q.not("finish", "is", null)),
    count("mtg_printings", (q) => q.eq("is_token", true).not("finish", "is", null)),
    count("mtg_printings", (q) => q.not("price_usd", "is", null).not("finish", "is", null)),
  ]);
  console.log(JSON.stringify({ sets, cards, rawPrintings: printings, collectiblePrintings: finishPrintings, tokenPrintings: tokens, pricedPrintings }, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
