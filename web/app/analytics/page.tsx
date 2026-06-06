export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getAllCards(supabase: any) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
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
      .gt("quantity", 0)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

function getBaseKey(card: any) {
  return `${card.name || ""}|${card.subtitle || ""}`;
}

function addToMap(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) || 0) + value);
}

function topEntries(map: Map<string, number>, limit = 8) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="sw-panel" style={{ padding: "18px", minHeight: "118px" }}>
      <div style={{ color: "#9b9b9b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: "24px", marginTop: "8px" }}>{value}</div>
      {sub ? <div style={{ color: "#cfcfcf", fontSize: "13px", marginTop: "7px", lineHeight: 1.4 }}>{sub}</div> : null}
    </div>
  );
}

function ListBox({ title, rows, prefix = "", suffix = "" }: { title: string; rows: { label: string; value: number }[]; prefix?: string; suffix?: string }) {
  return (
    <div className="sw-panel" style={{ padding: "18px" }}>
      <div style={{ color: "#fff", fontWeight: 900, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</div>
      <div style={{ display: "grid", gap: "10px" }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: "14px", color: "#cfcfcf", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
            <span>{row.label}</span>
            <span style={{ color: prefix ? "var(--accent)" : "#fff", fontWeight: 800 }}>{prefix}{row.value.toFixed(prefix ? 2 : 0)}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cards, collection] = await Promise.all([
    getAllCards(supabase),
    getAllCollection(supabase, user.id),
  ]);

  const cardById = new Map((cards || []).map((card: any) => [card.id, card]));
  const ownedIds = new Set(collection.map((item: any) => item.card_id));

  const collectionRows = collection
    .map((item: any) => ({
      ...item,
      card: cardById.get(item.card_id),
    }))
    .filter((item: any) => item.card);

  const totalCardsOwned = collectionRows.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
  const totalUniqueOwned = collectionRows.length;
  const totalCollectionValue = collectionRows.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.card?.price || 0),
    0
  );

  const highestOwned = [...collectionRows].sort(
    (a: any, b: any) => Number(b.card?.price || 0) - Number(a.card?.price || 0)
  )[0];

  const valueBySet = new Map<string, number>();
  const countBySet = new Map<string, number>();
  const valueByAspect = new Map<string, number>();
  const countByAspect = new Map<string, number>();
  const countByRarity = new Map<string, number>();

  for (const item of collectionRows) {
    const card = item.card;
    const qty = Number(item.quantity || 0);
    const value = qty * Number(card?.price || 0);
    const setCode = card?.set_code || "Unknown";
    const rarity = card?.rarity || "Unknown";

    addToMap(valueBySet, setCode, value);
    addToMap(countBySet, setCode, qty);
    addToMap(countByRarity, rarity, qty);

    const aspectText = String(card?.aspect || "No Aspect");
    const aspects = aspectText.split("|").map((x) => x.trim()).filter(Boolean);
    if (aspects.length === 0) aspects.push("No Aspect");
    for (const aspect of aspects) {
      addToMap(valueByAspect, aspect, value);
      addToMap(countByAspect, aspect, qty);
    }
  }

  const setCodes = Array.from(new Set((cards || []).map((card: any) => card.set_code).filter(Boolean))).sort();
  const setCompletion = setCodes.map((setCode) => {
    const setCards = cards.filter((card: any) => card.set_code === setCode);
    const baseKeys = new Set(setCards.map((card: any) => getBaseKey(card)));
    const cardIdToBaseKey = new Map(setCards.map((card: any) => [card.id, getBaseKey(card)]));
    const ownedBaseKeys = new Set(
      collection
        .map((item: any) => cardIdToBaseKey.get(item.card_id))
        .filter(Boolean)
    );

    const fullTotal = setCards.length;
    const fullOwned = setCards.filter((card: any) => ownedIds.has(card.id)).length;
    const baseTotal = baseKeys.size;
    const baseOwned = ownedBaseKeys.size;

    return {
      setCode,
      baseTotal,
      baseOwned,
      fullTotal,
      fullOwned,
      basePercent: baseTotal ? (baseOwned / baseTotal) * 100 : 0,
      fullPercent: fullTotal ? (fullOwned / fullTotal) * 100 : 0,
    };
  });

  const mostComplete = [...setCompletion].filter((s) => s.baseTotal > 0).sort((a, b) => b.basePercent - a.basePercent)[0];
  const leastComplete = [...setCompletion].filter((s) => s.baseTotal > 0).sort((a, b) => a.basePercent - b.basePercent)[0];

  return (
    <main>
      <div className="sw-kicker">Collection Databank</div>
      <h1 style={{ marginTop: "10px", marginBottom: "18px", fontSize: "42px" }}>Analytics</h1>
      <div className="sw-divider" style={{ marginBottom: "20px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px", marginBottom: "18px" }}>
        <MetricCard label="Total Collection Value" value={`$${totalCollectionValue.toFixed(2)}`} />
        <MetricCard label="Total Cards Owned" value={String(totalCardsOwned)} />
        <MetricCard label="Unique Cards Owned" value={String(totalUniqueOwned)} />
        <MetricCard label="Most Valuable Card" value={highestOwned?.card?.name || "-"} sub={highestOwned ? `${highestOwned.card?.set_code} #${highestOwned.card?.card_number} • $${Number(highestOwned.card?.price || 0).toFixed(2)}` : undefined} />
        <MetricCard label="Most Complete Set" value={mostComplete?.setCode || "-"} sub={mostComplete ? `${mostComplete.baseOwned}/${mostComplete.baseTotal} base (${mostComplete.basePercent.toFixed(1)}%)` : undefined} />
        <MetricCard label="Least Complete Set" value={leastComplete?.setCode || "-"} sub={leastComplete ? `${leastComplete.baseOwned}/${leastComplete.baseTotal} base (${leastComplete.basePercent.toFixed(1)}%)` : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        <ListBox title="Most Valuable Sets" rows={topEntries(valueBySet)} prefix="$" />
        <ListBox title="Most Owned Sets" rows={topEntries(countBySet)} />
        <ListBox title="Most Owned Aspects" rows={topEntries(countByAspect)} />
        <ListBox title="Most Valuable Aspects" rows={topEntries(valueByAspect)} prefix="$" />
        <ListBox title="Most Owned Rarities" rows={topEntries(countByRarity)} />
      </div>
    </main>
  );
}
