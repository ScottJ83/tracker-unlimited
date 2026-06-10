import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  cardImageUrl,
  setAssetUrl,
  fetchTcgDexCard,
  fetchTcgDexSet,
  fetchTcgDexSets,
  slugifyPokemonName,
  extractPrintsFromCard,
} from "@/lib/pokemon/tcgdex";

function asDate(value: any) {
  if (!value) return null;
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replaceAll("/", "-");
  return null;
}

function normalizeDexIds(card: any) {
  const candidates = [card?.dexId, card?.dexIds, card?.dex_id, card?.dex_ids];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0);
    }

    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber > 0) {
      return [asNumber];
    }
  }

  return [];
}

async function importOneSet({
  supabase,
  setId,
  maxCardsPerSet,
}: {
  supabase: any;
  setId: string;
  maxCardsPerSet: number | null;
}) {
  const set = await fetchTcgDexSet(setId);

  const setRow = {
    id: set.id,
    tcgdex_id: set.id,
    name: set.name,
    logo: setAssetUrl(set.logo),
    symbol: setAssetUrl(set.symbol),
    card_count_total: set.cardCount?.total || set.cardCount?.official || 0,
    card_count_official: set.cardCount?.official || 0,
    release_date: asDate(set.releaseDate),
    series_id: set.serie?.id || null,
    series_name: set.serie?.name || null,
    raw: set,
    updated_at: new Date().toISOString(),
  };

  const { error: setError } = await supabase
    .from("pokemon_sets")
    .upsert(setRow, { onConflict: "id" });

  if (setError) throw setError;

  const setCards = Array.isArray(set.cards) ? set.cards : [];
  const cards = maxCardsPerSet ? setCards.slice(0, maxCardsPerSet) : setCards;

  let cardsImported = 0;
  let printsImported = 0;
  const cardErrors: any[] = [];

  for (const cardResume of cards) {
    try {
      const card = await fetchTcgDexCard(cardResume.id);
      const slug = slugifyPokemonName(card.name);
      const cardImage = cardImageUrl(card.image);
      const dexIds = normalizeDexIds(card);

      const cardRow = {
        id: card.id,
        tcgdex_id: card.id,
        set_id: set.id,
        local_id: card.localId || null,
        name: card.name,
        slug,
        category: card.category || null,
        illustrator: card.illustrator || null,
        rarity: card.rarity || null,
        dex_ids: dexIds,
        hp: card.hp ? String(card.hp) : null,
        types: Array.isArray(card.types) ? card.types : [],
        stage: card.stage || null,
        image: cardImage,
        variants: card.variants || {},
        prices: card.pricing || card.prices || card.markets || {},
        legal: card.legal || {},
        raw: card,
        updated_at: new Date().toISOString(),
      };

      const { error: cardError } = await supabase
        .from("pokemon_cards")
        .upsert(cardRow, { onConflict: "id" });

      if (cardError) throw cardError;
      cardsImported += 1;

      const prints = extractPrintsFromCard(card);

      for (const print of prints) {
        const { error: printError } = await supabase
          .from("pokemon_prints")
          .upsert(
            {
              card_id: card.id,
              set_id: set.id,
              print_key: print.print_key,
              print_name: print.print_name,
              language: "en",
              is_available: print.is_available,
              image: cardImage,
              price_market: print.price_market ?? null,
              raw: print.raw || {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: "card_id,print_key,language" }
          );

        if (printError) throw printError;
        printsImported += 1;
      }
    } catch (error: any) {
      cardErrors.push({
        card: cardResume?.id,
        error: error?.message || String(error),
      });
    }
  }

  return {
    set: set.id,
    setName: set.name,
    cardsInSet: setCards.length,
    cardsAttempted: cards.length,
    cardsImported,
    printsImported,
    cardErrors,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const singleSetId = body?.singleSetId ? String(body.singleSetId).trim() : "";
  const offsetSets = Math.max(0, Number(body?.offsetSets || 0));
  const limitSets = Math.max(1, Number(body?.limitSets || 1));

  const maxCardsRaw = body?.maxCardsPerSet;
  const maxCardsPerSet =
    maxCardsRaw === undefined || maxCardsRaw === null || Number(maxCardsRaw) <= 0
      ? null
      : Math.max(1, Number(maxCardsRaw));

  try {
    const sets = await fetchTcgDexSets();

    const selectedSets = singleSetId
      ? [{ id: singleSetId }]
      : sets.slice(offsetSets, offsetSets + limitSets);

    let setsImported = 0;
    let cardsImported = 0;
    let printsImported = 0;
    const errors: any[] = [];
    const setResults: any[] = [];

    for (const setResume of selectedSets) {
      try {
        const result = await importOneSet({
          supabase,
          setId: setResume.id,
          maxCardsPerSet,
        });

        setResults.push(result);
        setsImported += 1;
        cardsImported += result.cardsImported;
        printsImported += result.printsImported;

        if (result.cardErrors.length) {
          errors.push(...result.cardErrors.map((item) => ({ set: setResume.id, ...item })));
        }
      } catch (error: any) {
        errors.push({
          set: setResume?.id,
          error: error?.message || String(error),
          details: error,
        });
      }
    }

    const nextOffset = singleSetId ? offsetSets : offsetSets + selectedSets.length;
    const done = singleSetId ? true : nextOffset >= sets.length;

    return NextResponse.json({
      ok: true,
      mode: singleSetId ? "single-set" : "batch",
      singleSetId: singleSetId || null,
      offsetSets,
      limitSets,
      totalSets: sets.length,
      nextOffset,
      done,
      setsImported,
      cardsImported,
      printsImported,
      setResults,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
