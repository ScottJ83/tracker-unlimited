import { createClient } from "@/lib/supabase/server";

export type PremadeDeckCard = {
  id: number;
  deck_id: string;
  card_name: string;
  quantity: number;
  card_number: string | null;
  set_code_hint: string | null;
  resolved_card_id: string | null;
  card_snapshot: any | null;
  match_status: string | null;
};

export type PremadeDeck = {
  id: string;
  slug: string;
  name: string;
  deck_type: string;
  product_wave: string | null;
  leader_name: string | null;
  base_name: string | null;
  sort_order: number | null;
};

function cardImage(card: any) {
  return card?._image || card?.image_url || card?.image || card?.front_image_url || card?.art_url || card?.card_image || null;
}

function cardType(card: any) {
  return card?.type || card?.card_type || card?.cardType || "Card";
}

function cardSubtitle(card: any) {
  return card?.subtitle || card?.subtitle_text || null;
}

function cardSetLine(card: any, fallbackSet?: string | null, fallbackNumber?: string | null) {
  const set = card?.set_code || card?.set || card?.setCode || fallbackSet || "";
  const num = card?.number || card?.card_number || card?.collector_number || card?.collectorNumber || fallbackNumber || "";
  return [set, num ? `#${num}` : null].filter(Boolean).join(" ");
}

function getCollectionCardKey(entry: any) {
  return entry?.card_id || entry?.cardId || entry?.cards_id || entry?.resolved_card_id || null;
}

async function getOwnedByCardId(supabase: any, userId?: string) {
  const owned = new Map<string, number>();
  if (!userId) return owned;

  const { data } = await supabase.from("collection_entries").select("*").eq("user_id", userId);
  for (const entry of data || []) {
    const key = getCollectionCardKey(entry);
    if (!key) continue;
    owned.set(String(key), (owned.get(String(key)) || 0) + Number(entry.quantity || 0));
  }
  return owned;
}

export function decorateDeck(deck: PremadeDeck, cards: PremadeDeckCard[], ownedByCardId: Map<string, number>) {
  let requiredCopies = 0;
  let ownedCopies = 0;
  let completedLines = 0;
  let totalValue = 0;
  let ownedValue = 0;
  let remainingValue = 0;

  const decoratedCards = cards.map((line) => {
    const required = Number(line.quantity || 0);
    const owned = line.resolved_card_id ? Number(ownedByCardId.get(String(line.resolved_card_id)) || 0) : 0;
    const countedOwned = Math.min(owned, required);
    const card = line.card_snapshot || {};
    const price = Number(card.price_market || card.price || card.market_price || card.usd || 0);
    const isComplete = countedOwned >= required;

    requiredCopies += required;
    ownedCopies += countedOwned;
    if (isComplete) completedLines += 1;
    totalValue += price * required;
    ownedValue += price * countedOwned;
    remainingValue += price * Math.max(required - countedOwned, 0);

    return {
      ...line,
      required,
      owned,
      countedOwned,
      missing: Math.max(required - countedOwned, 0),
      isComplete,
      card,
      image: cardImage(card),
      displayName: card?.name || line.card_name,
      subtitle: cardSubtitle(card),
      type: cardType(card),
      setLine: cardSetLine(card, line.set_code_hint, line.card_number),
      price,
    };
  });

  return {
    ...deck,
    cards: decoratedCards,
    requiredCopies,
    ownedCopies,
    missingCopies: Math.max(requiredCopies - ownedCopies, 0),
    completedLines,
    totalLines: cards.length,
    completion: requiredCopies ? Math.round((ownedCopies / requiredCopies) * 1000) / 10 : 0,
    totalValue,
    ownedValue,
    remainingValue,
  };
}

export async function getPremadeDeckList() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  const [{ data: decks }, { data: cards }, ownedByCardId] = await Promise.all([
    supabase.from("swu_premade_decks").select("*").order("sort_order", { ascending: true }),
    supabase.from("swu_premade_deck_cards").select("*").order("card_name", { ascending: true }),
    getOwnedByCardId(supabase, userId),
  ]);

  return (decks || []).map((deck: PremadeDeck) => {
    const deckCards = (cards || []).filter((line: PremadeDeckCard) => line.deck_id === deck.id);
    return decorateDeck(deck, deckCards, ownedByCardId);
  });
}

export async function getPremadeDeckBySlug(slug: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  const { data: deck } = await supabase.from("swu_premade_decks").select("*").eq("slug", slug).single();
  if (!deck) return null;

  const [{ data: cards }, ownedByCardId] = await Promise.all([
    supabase.from("swu_premade_deck_cards").select("*").eq("deck_id", deck.id).order("card_name", { ascending: true }),
    getOwnedByCardId(supabase, userId),
  ]);

  return decorateDeck(deck, cards || [], ownedByCardId);
}
