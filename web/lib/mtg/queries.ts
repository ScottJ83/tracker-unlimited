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

  for (let index = 0; index < ids.length; index += chunkSize) {
    const chunk = ids.slice(index, index + chunkSize);
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
    (query) => query.eq("user_id", userId)
  );
}

function totalEntryCopies(entry: any) {
  return Number(entry?.quantity || 0);
}

function withCollection(printing: any, ownedByPrinting: Map<string, any>) {
  const entry = ownedByPrinting.get(String(printing.id));
  const ownedCopies = totalEntryCopies(entry);
  return {
    ...printing,
    ownedCopies,
    isOwned: ownedCopies > 0,
    collectionEntry: entry || null,
  };
}

const PRINTING_SELECT = "id, base_scryfall_id, card_id, oracle_id, set_id, set_code, parent_set_code, collector_number, lang, layout, rarity, released_at, finishes, finish, finish_label, variant_label, frame_effects, promo_types, border_color, security_stamp, digital, foil, nonfoil, oversized, variation, booster, is_token, is_extra, image_small, image_normal, image_large, image_png, image_art_crop, image_border_crop, price_usd, price_usd_foil, price_usd_etched, price_eur, price_tix, mtg_cards(name, type_line, mana_cost, colors, color_identity)";

function collectorSortValue(value: any) {
  const text = String(value || "");
  const match = text.match(/^(\d+)/);
  const number = match ? Number(match[1]) : 999999;
  const suffix = text.replace(/^\d+/, "");
  return { number, suffix };
}

function finishOrder(finish: any) {
  const value = String(finish || "").toLowerCase();
  if (value === "nonfoil") return 1;
  if (value === "foil") return 2;
  if (value === "etched") return 3;
  return 9;
}

function sortPrintings(a: any, b: any) {
  const aNumber = collectorSortValue(a.collector_number);
  const bNumber = collectorSortValue(b.collector_number);
  if (aNumber.number !== bNumber.number) return aNumber.number - bNumber.number;
  if (aNumber.suffix !== bNumber.suffix) return aNumber.suffix.localeCompare(bNumber.suffix);
  const aToken = a.is_token ? 1 : 0;
  const bToken = b.is_token ? 1 : 0;
  if (aToken !== bToken) return aToken - bToken;
  const aVariant = String(a.variant_label || "");
  const bVariant = String(b.variant_label || "");
  if (aVariant !== bVariant) return aVariant.localeCompare(bVariant);
  return finishOrder(a.finish) - finishOrder(b.finish);
}

export async function getMtgCounts(supabase: any, userId?: string) {
  const [{ count: sets }, { count: cards }, { count: printings }] = await Promise.all([
    supabase.from("mtg_sets").select("*", { count: "exact", head: true }),
    supabase.from("mtg_cards").select("*", { count: "exact", head: true }),
    supabase.from("mtg_printings").select("*", { count: "exact", head: true }).not("finish", "is", null),
  ]);

  const entries = await getMtgCollectionEntries(supabase, userId);
  const ownedPrintings = entries.filter((entry: any) => totalEntryCopies(entry) > 0).length;
  const ownedCopies = entries.reduce((sum: number, entry: any) => sum + totalEntryCopies(entry), 0);

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
    fetchAllRows(supabase, "mtg_sets", "*", (query) => query.order("released_at", { ascending: false, nullsFirst: false })),
    fetchAllRows(supabase, "mtg_printings", "id, set_code, finish", (query) => query.not("finish", "is", null)),
    getMtgCollectionEntries(supabase, userId),
  ]);

  const owned = new Set(entries.filter((entry: any) => totalEntryCopies(entry) > 0).map((entry: any) => entry.printing_id));
  const totals = new Map<string, { total: number; owned: number }>();

  for (const printing of printings) {
    const code = String(printing.set_code || "").toLowerCase();
    if (!code) continue;
    if (!totals.has(code)) totals.set(code, { total: 0, owned: 0 });
    const item = totals.get(code)!;
    item.total += 1;
    if (owned.has(printing.id)) item.owned += 1;
  }

  return sets.map((set: any) => {
    const item = totals.get(String(set.code || "").toLowerCase()) || { total: 0, owned: 0 };
    return {
      ...set,
      printTotal: item.total,
      ownedPrintings: item.owned,
      completion: percent(item.owned, item.total),
    };
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
      PRINTING_SELECT,
      (query) => query.eq("set_code", normalizedCode).not("finish", "is", null).order("collector_number", { ascending: true })
    ),
    getMtgCollectionEntries(supabase, userId),
  ]);

  const ownedByPrinting = new Map<string, any>();
  for (const entry of entries || []) ownedByPrinting.set(String(entry.printing_id), entry);

  const enrichedPrintings = (printings || [])
    .map((printing: any) => withCollection(printing, ownedByPrinting))
    .sort(sortPrintings);

  const ownedPrintings = enrichedPrintings.filter((printing: any) => printing.isOwned).length;
  const ownedCopies = enrichedPrintings.reduce((sum: number, printing: any) => sum + Number(printing.ownedCopies || 0), 0);
  const totalValue = enrichedPrintings.reduce((sum: number, printing: any) => sum + Number(printing.price_usd || 0), 0);
  const ownedValue = enrichedPrintings.reduce((sum: number, printing: any) => {
    if (!printing.isOwned) return sum;
    return sum + Number(printing.ownedCopies || 0) * Number(printing.price_usd || 0);
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

export async function getMtgRecentCards(supabase: any, userId?: string, limit = 80) {
  const [printings, entries] = await Promise.all([
    fetchAllRows(
      supabase,
      "mtg_printings",
      PRINTING_SELECT,
      (query) => query.not("finish", "is", null).order("released_at", { ascending: false, nullsFirst: false }).limit(limit)
    ),
    getMtgCollectionEntries(supabase, userId),
  ]);

  const ownedByPrinting = new Map<string, any>();
  for (const entry of entries || []) ownedByPrinting.set(String(entry.printing_id), entry);

  return printings.map((printing: any) => withCollection(printing, ownedByPrinting)).sort(sortPrintings);
}

export async function getMtgOwnedCollection(supabase: any, userId?: string) {
  const entries = await getMtgCollectionEntries(supabase, userId);
  const ownedEntries = entries.filter((entry: any) => totalEntryCopies(entry) > 0);
  const ids = ownedEntries.map((entry: any) => entry.printing_id);
  if (!ids.length) return [];

  const printings = await fetchRowsByIds(supabase, "mtg_printings", PRINTING_SELECT, "id", ids);

  const ownedByPrinting = new Map<string, any>();
  for (const entry of entries || []) ownedByPrinting.set(String(entry.printing_id), entry);

  return printings.map((printing: any) => withCollection(printing, ownedByPrinting)).sort(sortPrintings);
}
