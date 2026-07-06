import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error("Missing Supabase env vars."); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });
async function count(table) { const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true }); if (error) throw error; return count || 0; }
async function main() {
  const [sets, cards, printings, priced] = await Promise.all([
    count("mtg_sets"), count("mtg_cards"), count("mtg_printings"),
    supabase.from("mtg_printings").select("*", { count: "exact", head: true }).or("price_usd.not.is.null,price_usd_foil.not.is.null,price_usd_etched.not.is.null").then(({ count, error }) => { if (error) throw error; return count || 0; })
  ]);
  console.log(JSON.stringify({ sets, cards, printings, pricedPrintings: priced }, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
