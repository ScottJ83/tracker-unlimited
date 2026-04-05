export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { createClient } from "@/lib/supabase/server";

const setOrder = [
  "LAW",
  "SEC",
  "JTL",
  "SOR",
  "LOF",
  "SHD",
  "TWI",
  "IBH",
  "SECW",
  "JTLW",
  "SORW",
  "LOFW",
  "SHDW",
  "TWIW",
  "LAWPR",
  "SECPR",
  "JTLPR",
  "SORPR",
  "LOFPR",
  "SHDPR",
  "TWIPR",
  "TS26",
];

const setColors: Record<string, string> = {
  LAW: "#c87a2c",
  SEC: "#5b3aa6",
  JTL: "#f2c200",
  SOR: "#d32f2f",
  LOF: "#2f6fd3",
  SHD: "#3949ab",
  TWI: "#8b1e2d",
  IBH: "#e5e7eb",
  SECW: "#4a2f85",
  JTLW: "#c9a200",
  SORW: "#a52727",
  LOFW: "#275fb8",
  SHDW: "#2c3b8f",
  TWIW: "#6f1823",
  LAWPR: "#c87a2c",
  SECPR: "#5b3aa6",
  JTLPR: "#f2c200",
  SORPR: "#d32f2f",
  LOFPR: "#2f6fd3",
  SHDPR: "#3949ab",
  TWIPR: "#8b1e2d",
  TS26: "#00bcd4",
};

async function getAllCards(supabase: any) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id,set_code,variant,price")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allCards = [...allCards, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
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
  const cards = await getAllCards(supabase);

  const { data: collection } = await supabase
    .from("collection_entries")
    .select("card_id,quantity")
    .eq("user_id", user.id)
    .gt("quantity", 0);

  if (error) return <main>Error loading sets.</main>;

  const collectionMap = new Map(
    (collection || []).map((item: any) => [item.card_id, Number(item.quantity || 0)])
  );

  const sortedSets = [...(sets || [])].sort((a, b) => {
    const aIndex = setOrder.indexOf(a.code);
    const bIndex = setOrder.indexOf(b.code);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <main>
      <h1 style={{ marginBottom: "18px" }}>Sets</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {sortedSets.map((set) => {
          const setCards = cards.filter(
            (card: any) =>
              String(card.set_code).trim().toUpperCase() ===
              String(set.code).trim().toUpperCase()
          );

          const baseCards = setCards.filter(
            (card: any) => String(card.variant).trim().toLowerCase() === "standard"
          );

          const baseTotal = baseCards.length;
          const baseOwned = baseCards.filter((card: any) => collectionMap.has(card.id)).length;
          const basePercent = baseTotal > 0 ? (baseOwned / baseTotal) * 100 : 0;

          const fullTotal = setCards.length;
          const fullOwned = setCards.filter((card: any) => collectionMap.has(card.id)).length;
          const fullPercent = fullTotal > 0 ? (fullOwned / fullTotal) * 100 : 0;

          const setValue = setCards.reduce((sum: number, card: any) => {
            const qty = collectionMap.get(card.id) || 0;
            return sum + qty * Number(card.price || 0);
          }, 0);

          return (
            <Link
              key={set.code}
              href={`/sets/${set.code}`}
              style={{
                border: "1px solid #334155",
                borderRadius: "18px",
                padding: "18px",
                background: "linear-gradient(180deg, #172033, #111827)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                borderTop: `4px solid ${setColors[set.code] || "#475569"}`,
              }}
            >
              <div style={{ color: "#7dd3fc", fontSize: "13px", marginBottom: "8px" }}>
                {set.code}
              </div>

              <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "14px" }}>
                {set.name}
              </div>

              <ProgressBar label="Base" value={basePercent} />
              <ProgressBar label="Full" value={fullPercent} />

              <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "10px" }}>
                <div>Base: {baseOwned} / {baseTotal}</div>
                <div>Full: {fullOwned} / {fullTotal}</div>
                <div>Value: ${setValue.toFixed(2)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}