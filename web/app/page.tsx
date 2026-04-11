import Link from "next/link";
import { supabase } from "@/lib/supabase";

async function getAllCollectionForHome(userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select(`
        quantity,
        cards (
          name,
          variant,
          price,
          set_code
        )
      `)
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

export default async function HomePage() {
  const userId = "81758ed6-6848-446a-9b57-f61e36fea5c9";

  const rows = await getAllCollectionForHome(userId);

  const totalCollectionValue = rows.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity || 0) * Number(item.cards?.price || 0),
    0
  );

  const totalCardCount = rows.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0),
    0
  );

  const highest = [...rows].sort(
    (a: any, b: any) =>
      Number(b.cards?.price || 0) * Number(b.quantity || 0) -
      Number(a.cards?.price || 0) * Number(a.quantity || 0)
  )[0];

  return (
    <main>
      <section
        style={{
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "32px",
          background: "linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <div style={{ color: "#7dd3fc", fontWeight: 700, letterSpacing: "0.12em" }}>
            STAR WARS UNLIMITED
          </div>

          <h1 style={{ fontSize: "42px", margin: "12px 0 10px 0" }}>
            Tracker Unlimited
          </h1>

          <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
            Track your collection, view set progress, and manage every collectible variant.
          </p>

          <div style={{ marginTop: "20px", color: "#e5edf7" }}>
            <div>Total Cards: {totalCardCount}</div>
            <div>Total Collection Value: ${totalCollectionValue.toFixed(2)}</div>

            {highest ? (
              <div style={{ marginTop: "8px" }}>
                Highest Value Card: {highest.cards?.name} ({highest.cards?.variant}) — $
                {(Number(highest.cards?.price || 0) * Number(highest.quantity || 0)).toFixed(2)}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "22px" }}>
            <Link
              href="/sets"
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#1e293b",
                border: "1px solid #475569",
              }}
            >
              Browse Sets
            </Link>

            <Link
              href="/collection"
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#0f172a",
                border: "1px solid #334155",
              }}
            >
              View Collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}