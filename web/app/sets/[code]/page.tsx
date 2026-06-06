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

  const allBaseKeys = new Set(safeCards.map((card: any) => getBaseKey(card)));

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

  const missingBaseCost = Array.from(allBaseKeys).reduce((sum: number, key: any) => {
    if (ownedBaseKeys.has(key)) return sum;
    const options = safeCards.filter((card: any) => getBaseKey(card) === key);
    const cheapest = options.reduce((best: number | null, card: any) => {
      const price = Number(card.price || 0);
      if (price <= 0) return best;
      if (best === null || price < best) return price;
      return best;
    }, null);
    return sum + Number(cheapest || 0);
  }, 0);

  const missingFullCost = safeCards.reduce((sum: number, card: any) => {
    if (ownedCardIds.has(card.id)) return sum;
    return sum + Number(card.price || 0);
  }, 0);

  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Set Databank</div>
        <h1 className="sw-page-title">{setInfo?.name || code}</h1>
        <div className="sw-page-subtitle">
          Track owned variants, hidden missing cards, set value, and completion cost.
        </div>
      </div>

      <section className="sw-shell" style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "16px" }}>
          <div className="sw-stat-card"><div className="sw-muted" style={{ fontSize: 12 }}>Base</div><strong>{baseOwned} / {baseTotal}</strong></div>
          <div className="sw-stat-card"><div className="sw-muted" style={{ fontSize: 12 }}>Full</div><strong>{fullOwned} / {fullTotal}</strong></div>
          <div className="sw-stat-card"><div className="sw-muted" style={{ fontSize: 12 }}>Owned Value</div><strong>${setValue.toFixed(2)}</strong></div>
          <div className="sw-stat-card"><div className="sw-muted" style={{ fontSize: 12 }}>Cost To Complete</div><strong>${missingFullCost.toFixed(2)}</strong></div>
        </div>

        <ProgressBar label="Base Set Completion" value={basePercent} />
        <ProgressBar label="Full Set Completion" value={fullPercent} />
        <div className="sw-data-row" style={{ marginTop: "12px" }}>
          <div>Base Missing Cost: ${missingBaseCost.toFixed(2)}</div>
          <div>Full Missing Cost: ${missingFullCost.toFixed(2)}</div>
        </div>
      </section>

      <SetClient cards={safeCards} collection={safeCollection} userId={user.id} />
    </main>
  );
}
