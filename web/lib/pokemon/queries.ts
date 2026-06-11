import { createClient } from "@/lib/supabase/server";
import { POKEMON_NATIONAL_TOTAL, pokemonRegions, percent } from "./tcgdex";

const SUPABASE_PAGE_SIZE = 1000;

export async function getPokemonUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function fetchAllRows(
  supabase: any,
  table: string,
  select: string,
  buildQuery?: (query: any) => any
) {
  const rows: any[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select(select)
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (buildQuery) query = buildQuery(query);

    const { data, error } = await query;

    if (error) throw error;
    if (!data?.length) break;

    rows.push(...data);

    if (data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }

  return rows;
}

export async function getPokemonCollectionEntries(supabase: any, userId?: string) {
  if (!userId) return [];

  return fetchAllRows(
    supabase,
    "pokemon_collection_entries",
    "id, print_id, quantity, condition, notes",
    (query) => query.eq("user_id", userId).gt("quantity", 0)
  );
}

export async function getPokemonWishlistEntries(supabase: any, userId?: string) {
  if (!userId) return [];

  return fetchAllRows(
    supabase,
    "pokemon_wishlist_entries",
    "id, print_id, priority, notes",
    (query) => query.eq("user_id", userId)
  );
}

function firstDexId(card: any) {
  const dex = Array.isArray(card?.dex_ids) ? Number(card.dex_ids[0]) : null;
  return Number.isFinite(dex || NaN) ? dex : null;
}

function speciesKey(card: any) {
  const dex = firstDexId(card);
  return dex ? `dex-${dex}` : `name-${card.slug || card.name}`;
}

function cleanSpeciesName(name: string) {
  return String(name || "")
    .replace(/^.+?'s\s+/i, "")
    .replace(/\b(GX|EX|VSTAR|VMAX|V-UNION|V)\b/gi, "")
    .replace(/\b(Alolan|Galarian|Hisuian|Paldean)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function chooseSpeciesName(current: string | null, next: string) {
  if (!current) return next;

  const currentClean = cleanSpeciesName(current);
  const nextClean = cleanSpeciesName(next);

  if (nextClean.length && nextClean.length < currentClean.length) return next;
  if (/^[A-Za-z0-9\s.-]+$/.test(next) && next.length < current.length) return next;

  return current;
}

export async function getPokemonCounts(supabase: any, userId?: string) {
  const [{ count: cardCount }, { count: printCount }, { count: setCount }] = await Promise.all([
    supabase.from("pokemon_cards").select("*", { count: "exact", head: true }),
    supabase.from("pokemon_prints").select("*", { count: "exact", head: true }),
    supabase.from("pokemon_sets").select("*", { count: "exact", head: true }),
  ]);

  const [dexCards, ownedEntries, wishlistEntries] = await Promise.all([
    fetchAllRows(supabase, "pokemon_cards", "id, name, slug, dex_ids"),
    getPokemonCollectionEntries(supabase, userId),
    getPokemonWishlistEntries(supabase, userId),
  ]);

  const importedPokemon = new Set<string>();
  for (const card of dexCards || []) {
    const dex = firstDexId(card);
    if (dex) importedPokemon.add(String(dex));
  }

  const ownedPrintIds = new Set((ownedEntries || []).map((entry: any) => entry.print_id));
  const wishedPrintIds = new Set((wishlistEntries || []).map((entry: any) => entry.print_id));

  let ownedCards = 0;
  let ownedPokemon = 0;
  let collectionValue = 0;
  let wishlistValue = 0;

  if (ownedPrintIds.size) {
    const ownedPrints = await fetchRowsByIds(
      supabase,
      "pokemon_prints",
      "id, price_market, pokemon_cards(id, name, slug, dex_ids)",
      "id",
      Array.from(ownedPrintIds)
    );

    const ownedCardIds = new Set<string>();
    const ownedSpecies = new Set<string>();

    for (const print of ownedPrints || []) {
      const entry = (ownedEntries || []).find((item: any) => item.print_id === print.id);
      const quantity = Number(entry?.quantity || 0);
      collectionValue += quantity * Number(print.price_market || 0);

      const card = Array.isArray(print.pokemon_cards) ? print.pokemon_cards[0] : print.pokemon_cards;
      const dex = firstDexId(card);

      if (card?.id) ownedCardIds.add(card.id);
      if (dex) ownedSpecies.add(String(dex));
    }

    ownedCards = ownedCardIds.size;
    ownedPokemon = ownedSpecies.size;
  }

  if (wishedPrintIds.size) {
    const wishedPrints = await fetchRowsByIds(
      supabase,
      "pokemon_prints",
      "id, price_market",
      "id",
      Array.from(wishedPrintIds)
    );

    for (const print of wishedPrints || []) {
      wishlistValue += Number(print.price_market || 0);
    }
  }

  return {
    sets: setCount || 0,
    cards: cardCount || 0,
    prints: printCount || 0,
    importedPokemon: importedPokemon.size,
    nationalPokemonTotal: POKEMON_NATIONAL_TOTAL,
    ownedPokemon,
    ownedCards,
    ownedPrints: ownedPrintIds.size,
    wishedPrints: wishedPrintIds.size,
    collectionValue,
    wishlistValue,
    pokemonCompletion: percent(ownedPokemon, POKEMON_NATIONAL_TOTAL),
    cardCompletion: percent(ownedCards, cardCount || 0),
    printCompletion: percent(ownedPrintIds.size, printCount || 0),
  };
}

async function fetchRowsByIds(
  supabase: any,
  table: string,
  select: string,
  column: string,
  ids: any[]
) {
  const rows: any[] = [];
  const chunkSize = 500;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { data, error } = await supabase.from(table).select(select).in(column, chunk);
    if (error) throw error;
    rows.push(...(data || []));
  }

  return rows;
}

export async function getPokemonPokedexRows(supabase: any, userId?: string) {
  const [cards, ownedEntries] = await Promise.all([
    fetchAllRows(
      supabase,
      "pokemon_cards",
      "id, name, slug, dex_ids, image",
      (query) => query.not("dex_ids", "eq", "{}").order("name", { ascending: true })
    ),
    getPokemonCollectionEntries(supabase, userId),
  ]);

  const ownedPrintIds = new Set((ownedEntries || []).map((entry: any) => entry.print_id));
  const ownedCardIds = new Set<string>();

  if (ownedPrintIds.size) {
    const ownedPrints = await fetchRowsByIds(
      supabase,
      "pokemon_prints",
      "id, card_id",
      "id",
      Array.from(ownedPrintIds)
    );

    for (const print of ownedPrints || []) ownedCardIds.add(print.card_id);
  }

  const grouped = new Map<string, any>();

  for (const card of cards || []) {
    const dex = firstDexId(card);
    const key = speciesKey(card);

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: cleanSpeciesName(card.name) || card.name,
        displayName: card.name,
        slug: dex ? `dex-${dex}` : card.slug,
        dex,
        images: [],
        cardCount: 0,
        ownedCardCount: 0,
      });
    }

    const row = grouped.get(key);
    row.displayName = chooseSpeciesName(row.displayName, card.name);
    row.name = cleanSpeciesName(row.displayName) || row.displayName;
    row.cardCount += 1;

    if (ownedCardIds.has(card.id)) row.ownedCardCount += 1;
    if (card.image && row.images.length < 18) row.images.push(card.image);
    if (!row.dex && dex) row.dex = dex;
  }

  return Array.from(grouped.values()).sort((a, b) => {
    if (a.dex && b.dex) return a.dex - b.dex;
    if (a.dex) return -1;
    if (b.dex) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getPokemonSetsWithCompletion(supabase: any, userId?: string) {
  const [sets, prints, ownedEntries] = await Promise.all([
    fetchAllRows(
      supabase,
      "pokemon_sets",
      "*",
      (query) => query.order("release_date", { ascending: false, nullsFirst: false })
    ),
    fetchAllRows(supabase, "pokemon_prints", "id, set_id"),
    getPokemonCollectionEntries(supabase, userId),
  ]);

  const ownedPrintIds = new Set((ownedEntries || []).map((entry: any) => entry.print_id));
  const totals = new Map<string, { total: number; owned: number }>();

  for (const print of prints || []) {
    if (!print.set_id) continue;
    if (!totals.has(print.set_id)) totals.set(print.set_id, { total: 0, owned: 0 });
    const item = totals.get(print.set_id)!;
    item.total += 1;
    if (ownedPrintIds.has(print.id)) item.owned += 1;
  }

  return (sets || []).map((set: any) => {
    const item = totals.get(set.id) || { total: 0, owned: 0 };
    return {
      ...set,
      printTotal: item.total,
      ownedPrints: item.owned,
      completion: percent(item.owned, item.total),
    };
  });
}

export async function getPokemonRegionsWithCompletion(supabase: any, userId?: string) {
  const pokedexRows = await getPokemonPokedexRows(supabase, userId);

  return pokemonRegions.map((region) => {
    const rows = pokedexRows.filter((row: any) => row.dex && row.dex >= region.start && row.dex <= region.end);
    const owned = rows.filter((row: any) => row.ownedCardCount > 0).length;

    return {
      ...region,
      pokemonCount: rows.length,
      ownedPokemon: owned,
      cardCount: rows.reduce((sum: number, row: any) => sum + Number(row.cardCount || 0), 0),
      completion: percent(owned, region.end - region.start + 1),
      preview: rows.slice(0, 9),
    };
  });
}
