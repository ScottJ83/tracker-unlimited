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

async function fetchRowsByIds(supabase: any, table: string, select: string, column: string, ids: any[]) {
  const rows: any[] = [];
  const chunkSize = 500;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    const { data, error } = await supabase.from(table).select(select).in(column, chunk);
    if (error) throw error;
    rows.push(...(data || []));
  }

  return rows;
}

export async function getMtgCollectionEntries(supabase: any, userId?: string) {
  if (!userId) return [];

  return fetchAllRows(
    supabase,
    "mtg_collection_entries",
    "id, printing_id, quantity, foil_quantity, etched_quantity",
    (q) => q.eq("user_id", userId)
  );
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

export async function getMtgSetDetail(supabase: any, code: string, userId?: string) {
  const normalizedCode = String(code || "").toLowerCase();

  const { data: set, error: setError } = await supabase
    .from("mtg_sets")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (setError) throw setError;
  if (!set) return null;

  const [printings, entries] = await Promise.all([
    fetchAllRows(
      supabase,
      "mtg_printings",
      "id, card_id, oracle_id, set_id, set_code, collector_number, lang, layout, rarity, released_at, finishes, frame_effects, promo_types, border_color, security_stamp, digital, foil, nonfoil, oversized, variation, booster, image_small, image_normal, image_large, image_png, image_art_crop, image_border_crop, price_usd, price_usd_foil, price_usd_etched, price_eur, price_tix, mtg_cards(name, type_line, mana_cost, colors, color_identity)",
      (q) => q.eq("set_code", normalizedCode).order("collector_number", { ascending: true })
    ),
    getMtgCollectionEntries(supabase, userId),
  ]);

  const ownedByPrinting = new Map<string, any>();
  for (const entry of entries || []) {
    ownedByPrinting.set(String(entry.printing_id), entry);
  }

  const enrichedPrintings = (printings || []).map((printing: any) => {
    const entry = ownedByPrinting.get(String(printing.id));
    const ownedCopies = Number(entry?.quantity || 0) + Number(entry?.foil_quantity || 0) + Number(entry?.etched_quantity || 0);
    return {
      ...printing,
      ownedCopies,
      isOwned: ownedCopies > 0,
      collectionEntry: entry || null,
    };
  });

  const ownedPrintings = enrichedPrintings.filter((printing: any) => printing.isOwned).length;
  const ownedCopies = enrichedPrintings.reduce((sum: number, printing: any) => sum + Number(printing.ownedCopies || 0), 0);
  const totalValue = enrichedPrintings.reduce((sum: number, printing: any) => sum + Number(printing.price_usd || printing.price_usd_foil || printing.price_usd_etched || 0), 0);
  const ownedValue = enrichedPrintings.reduce((sum: number, printing: any) => {
    if (!printing.isOwned) return sum;
    return sum + Number(printing.ownedCopies || 0) * Number(printing.price_usd || printing.price_usd_foil || printing.price_usd_etched || 0);
  }, 0);

  return {
    set,
    printings: enrichedPrintings,
    stats: {
      totalPrintings: enrichedPrintings.length,
      ownedPrintings,
      ownedCopies,
      completion: percent(ownedPrintings, enrichedPrintings.length),
      totalValue,
      ownedValue,
    },
  };
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
