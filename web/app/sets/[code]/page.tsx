export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import SetClient from "@/components/SetClient";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ code: string }>;
};

function getBaseKey(card: any) {
  return `${card.name || ""}|${card.subtitle || ""}`;
}

async function getSetCards(supabase: any, code: string) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("set_code", code)
      .order("card_number", { ascending: true })
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

export default async function SetDetailPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cards = await getSetCards(supabase, code);

  const { data: setInfo } = await supabase
    .from("sets")
    .select("name")
    .eq("code", code)
    .single();

  const collection = await getAllCollection(supabase, user.id);

  const safeCards = cards || [];
  const safeCollection = collection || [];

  const cardIdToBaseKey = new Map(
    safeCards.map((card: any) => [card.id, getBaseKey(card)])
  );

  const allBaseKeys = new Set(
    safeCards.map((card: any) => getBaseKey(card))
  );

  const ownedCardIds = new Set(
    safeCollection
      .filter((item: any) => item.quantity > 0)
      .map((item: any) => item.card_id)
  );

  const ownedBaseKeys = new Set(
    safeCollection
      .filter((item: any) => item.quantity > 0)
      .map((item: any) => cardIdToBaseKey.get(item.card_id))
      .filter(Boolean)
  );

  const baseTotal = allBaseKeys.size;
  const baseOwned = ownedBaseKeys.size;
  const basePercent = baseTotal === 0 ? 0 : (baseOwned / baseTotal) * 100;

  const fullTotal = safeCards.length;
  const fullOwned = safeCards.filter((card: any) => ownedCardIds.has(card.id)).length;
  const fullPercent = fullTotal === 0 ? 0 : (fullOwned / fullTotal) * 100;

  const setValue = safeCards.reduce((sum: number, card: any) => {
    const entry = safeCollection.find((item: any) => item.card_id === card.id);
    const qty = Number(entry?.quantity || 0);
    return sum + qty * Number(card.price || 0);
  }, 0);

  const baseRepresentativeByKey = new Map<string, any>();
  for (const card of safeCards) {
    const key = getBaseKey(card);
    const existing = baseRepresentativeByKey.get(key);
    if (!existing) {
      baseRepresentativeByKey.set(key, card);
      continue;
    }

    const existingRank = existing.variant === "Standard" || existing.variant === "OP Promo" ? 0 : 1;
    const cardRank = card.variant === "Standard" || card.variant === "OP Promo" ? 0 : 1;
    if (cardRank < existingRank) baseRepresentativeByKey.set(key, card);
  }

  const missingBaseCards = Array.from(baseRepresentativeByKey.values()).filter(
    (card: any) => !ownedBaseKeys.has(getBaseKey(card))
  );

  const baseCostToComplete = missingBaseCards.reduce(
    (sum: number, card: any) => sum + Number(card.price || 0),
    0
  );

  const missingFullCards = safeCards.filter((card: any) => !ownedCardIds.has(card.id));
  const fullCostToComplete = missingFullCards.reduce(
    (sum: number, card: any) => sum + Number(card.price || 0),
    0
  );

  return (
    <main style={{ padding: "20px" }}>
      <h1>{setInfo?.name || code}</h1>

      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "18px",
          background: "linear-gradient(180deg, #172033, #111827)",
          display: "grid",
          gap: "8px",
        }}
      >
        <ProgressBar label="Base Set Completion" value={basePercent} />
        <ProgressBar label="Full Set Completion" value={fullPercent} />
        <div>Base: {baseOwned} / {baseTotal}</div>
        <div>Full: {fullOwned} / {fullTotal}</div>
        <div>Set Value: ${setValue.toFixed(2)}</div>
        <div>Base Missing: {missingBaseCards.length}</div>
        <div>Cost To Complete Base: ${baseCostToComplete.toFixed(2)}</div>
        <div>Full Missing: {missingFullCards.length}</div>
        <div>Cost To Complete Full: ${fullCostToComplete.toFixed(2)}</div>
      </div>

      <SetClient cards={safeCards} collection={safeCollection} userId={user.id} />
    </main>
  );
}
