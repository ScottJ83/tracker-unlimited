export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetsClient from "@/components/SetsClient";

function getBaseKey(card: any) {
  return `${card.name || ""}|${card.subtitle || ""}`;
}

async function getAllCards(supabase: any) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allCards = [...allCards, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
}

async function getAllCollection(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select("*")
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export default async function SetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sets, error } = await supabase.from("sets").select("*");

  if (error) {
    return <main>Error loading sets: {error.message}</main>;
  }

  const [cards, collection] = await Promise.all([
    getAllCards(supabase),
    getAllCollection(supabase, user.id),
  ]);

  const ownedCardIds = new Set(
    (collection || [])
      .filter((item: any) => Number(item.quantity || 0) > 0)
      .map((item: any) => item.card_id)
  );

  const enrichedSets = (sets || []).map((set: any) => {
    const code = String(set.code || "").trim().toUpperCase();
    const setCards = (cards || []).filter(
      (card: any) => String(card.set_code || "").trim().toUpperCase() === code
    );

    const baseKeys = new Set(setCards.map((card: any) => getBaseKey(card)));
    const cardIdToBaseKey = new Map(
      setCards.map((card: any) => [card.id, getBaseKey(card)])
    );

    const ownedBaseKeys = new Set(
      (collection || [])
        .filter((item: any) => Number(item.quantity || 0) > 0)
        .map((item: any) => cardIdToBaseKey.get(item.card_id))
        .filter(Boolean)
    );

    const ownedValue = setCards.reduce((sum: number, card: any) => {
      const entry = (collection || []).find((item: any) => item.card_id === card.id);
      const qty = Number(entry?.quantity || 0);
      return sum + qty * Number(card.price || 0);
    }, 0);

    return {
      ...set,
      code,
      baseOwned: ownedBaseKeys.size,
      baseTotal: baseKeys.size,
      fullOwned: setCards.filter((card: any) => ownedCardIds.has(card.id)).length,
      fullTotal: setCards.length,
      ownedValue,
    };
  });

  return <SetsClient sets={enrichedSets} />;
}
