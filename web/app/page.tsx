import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getAllCollectionForHome(supabase: any, userId: string) {
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

async function getLastPriceRefresh(supabase: any) {
  const { data } = await supabase
    .from("price_refresh_log")
    .select("*")
    .order("refreshed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data || null;
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [collection, lastPriceRefresh] = await Promise.all([
    getAllCollectionForHome(supabase, user.id),
    getLastPriceRefresh(supabase),
  ]);

  const rows = (collection || []).map((item: any) => ({
    ...item,
    card: Array.isArray(item.cards) ? item.cards[0] : item.cards,
  }));

  const totalCardsOwned = rows.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0),
    0
  );

  const totalUniqueCards = rows.length;

  const totalValue = rows.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity || 0) * Number(item.card?.price || 0),
    0
  );

  const highest = [...rows].sort(
    (a: any, b: any) =>
      Number(b.card?.price || 0) * Number(b.quantity || 0) -
      Number(a.card?.price || 0) * Number(a.quantity || 0)
  )[0];

const lastRefreshLabel = lastPriceRefresh?.refreshed_at
  ? new Date(lastPriceRefresh.refreshed_at).toLocaleDateString()
  : "Not recorded yet";

  return (
    <main>
      <section
        style={{
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "32px",
          background:
            "linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <div
            style={{
              color: "#7dd3fc",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            STAR WARS UNLIMITED
          </div>
          <h1 style={{ fontSize: "42px", margin: "12px 0 10px 0" }}>
            Tracker Unlimited
          </h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
            Track your collection, view set progress, and manage every collectible
            variant.
          </p>

          <div
            style={{
              marginTop: "20px",
              color: "#e5edf7",
              display: "grid",
              gap: "8px",
            }}
          >
            <div>Total Cards Owned: {totalCardsOwned}</div>
            <div>Total Unique Cards Owned: {totalUniqueCards}</div>
            <div>Total Collection Value: ${totalValue.toFixed(2)}</div>
            <div>Last Price Refresh: {lastRefreshLabel}</div>
            {highest ? (
              <div>
                Highest Value Card: {highest.card?.name} ({highest.card?.variant}) — $
                {(
                  Number(highest.card?.price || 0) * Number(highest.quantity || 0)
                ).toFixed(2)}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "22px", flexWrap: "wrap" }}>
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
