export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import SetClient from "@/components/SetClient";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ code: string }>;
};

async function getSetCards(supabase: any, code: string) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("set_code", code)
      .range(from, from + pageSize - 1)
      .order("card_number", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) break;

    allCards = [...allCards, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
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

  const { data: collection } = await supabase
    .from("collection_entries")
    .select("*")
    .eq("user_id", user.id);

  const baseCards = (cards || []).filter((card: any) => card.variant === "Standard");
  const fullCards = cards || [];

  const ownedCardIds = new Set(
    (collection || [])
      .filter((item: any) => item.quantity > 0)
      .map((item: any) => item.card_id)
  );

  const baseTotal = baseCards.length;
  const baseOwned = baseCards.filter((card: any) => ownedCardIds.has(card.id)).length;
  const basePercent = baseTotal === 0 ? 0 : (baseOwned / baseTotal) * 100;

  const fullTotal = fullCards.length;
  const fullOwned = fullCards.filter((card: any) => ownedCardIds.has(card.id)).length;
  const fullPercent = fullTotal === 0 ? 0 : (fullOwned / fullTotal) * 100;

  const setValue = fullCards.reduce((sum: number, card: any) => {
    const entry = (collection || []).find((item: any) => item.card_id === card.id);
    const qty = Number(entry?.quantity || 0);
    return sum + qty * Number(card.price || 0);
  }, 0);

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
        }}
      >
        <ProgressBar label="Base Set Completion" value={basePercent} />
        <ProgressBar label="Full Set Completion" value={fullPercent} />
        <div>Base: {baseOwned} / {baseTotal}</div>
        <div>Full: {fullOwned} / {fullTotal}</div>
        <div>Set Value: ${setValue.toFixed(2)}</div>
      </div>

      <SetClient cards={cards} collection={collection} />
    </main>
  );
}