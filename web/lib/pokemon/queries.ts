import { createClient } from "@/lib/supabase/server";
import { pokemonRegions } from "./tcgdex";

export async function getPokemonUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getPokemonCounts(supabase: any, userId?: string) {
  const [{ count: cardCount }, { count: printCount }, { count: setCount }] = await Promise.all([
    supabase.from("pokemon_cards").select("*", { count: "exact", head: true }),
    supabase.from("pokemon_prints").select("*", { count: "exact", head: true }),
    supabase.from("pokemon_sets").select("*", { count: "exact", head: true }),
  ]);

  let ownedPrints = 0;
  let wishedPrints = 0;

  if (userId) {
    const [{ count: owned }, { count: wished }] = await Promise.all([
      supabase
        .from("pokemon_collection_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gt("quantity", 0),
      supabase
        .from("pokemon_wishlist_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    ownedPrints = owned || 0;
    wishedPrints = wished || 0;
  }

  return {
    cards: cardCount || 0,
    prints: printCount || 0,
    sets: setCount || 0,
    ownedPrints,
    wishedPrints,
  };
}

export async function getPokemonPokedexRows(supabase: any) {
  const { data } = await supabase
    .from("pokemon_cards")
    .select("name, slug, dex_ids, image, id")
    .not("dex_ids", "eq", "{}")
    .order("name", { ascending: true })
    .limit(2000);

  const grouped = new Map<string, any>();

  for (const card of data || []) {
    const dex = Array.isArray(card.dex_ids) ? card.dex_ids[0] : null;
    const key = card.slug || card.name;

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: card.name,
        slug: card.slug,
        dex,
        images: [],
        cardCount: 0,
      });
    }

    const row = grouped.get(key);
    row.cardCount += 1;
    if (card.image && row.images.length < 12) row.images.push(card.image);
    if (!row.dex && dex) row.dex = dex;
  }

  return Array.from(grouped.values()).sort((a, b) => {
    if (a.dex && b.dex) return a.dex - b.dex;
    if (a.dex) return -1;
    if (b.dex) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getPokemonSets(supabase: any) {
  const { data } = await supabase
    .from("pokemon_sets")
    .select("*")
    .order("release_date", { ascending: false, nullsFirst: false });

  return data || [];
}

export async function getPokemonRegions(supabase: any) {
  const { data } = await supabase
    .from("pokemon_cards")
    .select("name, slug, dex_ids, image, id")
    .not("dex_ids", "eq", "{}");

  return pokemonRegions.map((region) => {
    const cards = (data || []).filter((card: any) => {
      const dex = Array.isArray(card.dex_ids) ? card.dex_ids[0] : null;
      return dex && dex >= region.start && dex <= region.end;
    });

    const pokemon = new Map<string, any>();
    for (const card of cards) {
      const key = card.slug || card.name;
      if (!pokemon.has(key)) {
        pokemon.set(key, {
          name: card.name,
          slug: card.slug,
          dex: Array.isArray(card.dex_ids) ? card.dex_ids[0] : null,
          image: card.image,
          cardCount: 0,
        });
      }
      pokemon.get(key).cardCount += 1;
    }

    return {
      ...region,
      pokemonCount: pokemon.size,
      cardCount: cards.length,
      preview: Array.from(pokemon.values()).slice(0, 9),
    };
  });
}
