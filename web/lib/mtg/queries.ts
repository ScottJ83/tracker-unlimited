import { createClient } from "@/lib/supabase/server";
import { percent } from "./format";

const PAGE_SIZE = 1000;

export async function getMtgUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function fetchAllRows(supabase: any, table: string, select: string, build?: (q: any) => any) {
  const rows: any[] = [];
  let from = 0;
  while (true) {
    let query = supabase.from(table).select(select).range(from, from + PAGE_SIZE - 1);
    if (build) query = build(query);
    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

export async function getMtgCollectionEntries(supabase: any, userId?: string) {
  if (!userId) return [];
  return fetchAllRows(supabase, "mtg_collection_entries", "id, printing_id, quantity, foil_quantity, etched_quantity", (q) => q.eq("user_id", userId));
}

export async function getMtgCounts(supabase: any, userId?: string) {
  const [{ count: sets }, { count: cards }, { count: printings }] = await Promise.all([
    supabase.from("mtg_sets").select("*", { count: "exact", head: true }),
    supabase.from("mtg_cards").select("*", { count: "exact", head: true }),
    supabase.from("mtg_printings").select("*", { count: "exact", head: true }),
  ]);

  const entries = await getMtgCollectionEntries(supabase, userId);
  const ownedPrintings = entries.filter((e: any) => Number(e.quantity || 0) + Number(e.foil_quantity || 0) + Number(e.etched_quantity || 0) > 0).length;
  const ownedCopies = entries.reduce((sum: number, e: any) => sum + Number(e.quantity || 0) + Number(e.foil_quantity || 0) + Number(e.etched_quantity || 0), 0);

  return {
    sets: sets || 0,
    cards: cards || 0,
    printings: printings || 0,
    ownedPrintings,
    ownedCopies,
    printCompletion: percent(ownedPrintings, printings || 0),
  };
}

export async function getMtgSets(supabase: any, userId?: string) {
  const [sets, printings, entries] = await Promise.all([
    fetchAllRows(supabase, "mtg_sets", "*", (q) => q.order("released_at", { ascending: false, nullsFirst: false })),
    fetchAllRows(supabase, "mtg_printings", "id, set_code"),
    getMtgCollectionEntries(supabase, userId),
  ]);
  const owned = new Set(entries.map((e: any) => e.printing_id));
  const totals = new Map<string, { total: number; owned: number }>();
  for (const p of printings) {
    const code = String(p.set_code || "").toLowerCase();
    if (!code) continue;
    if (!totals.has(code)) totals.set(code, { total: 0, owned: 0 });
    const item = totals.get(code)!;
    item.total += 1;
    if (owned.has(p.id)) item.owned += 1;
  }
  return sets.map((set: any) => {
    const item = totals.get(String(set.code || "").toLowerCase()) || { total: 0, owned: 0 };
    return { ...set, printTotal: item.total, ownedPrintings: item.owned, completion: percent(item.owned, item.total) };
  });
}

export async function getMtgRecentCards(supabase: any, limit = 24) {
  const { data, error } = await supabase
    .from("mtg_printings")
    .select("id, set_code, collector_number, rarity, image_normal, image_large, price_usd, mtg_cards(name, type_line)")
    .order("released_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
