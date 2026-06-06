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
        className="tu-panel"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "42px",
          minHeight: "430px",
          display: "grid",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 72% 42%, rgba(21,61,115,0.38), transparent 36%), radial-gradient(circle at 32% 68%, rgba(245,197,66,0.08), transparent 22%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "820px", position: "relative", zIndex: 1 }}>
          <div className="tu-page-kicker">Collection Databank</div>
          <h1>Tracker Unlimited</h1>
          <p className="tu-page-subtitle">
            Track your collection, monitor set completion, manage wishlists, and build decks for Star Wars Unlimited.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
              marginTop: "26px",
            }}
          >
            <div className="tu-stat">
              <div className="tu-stat-label">Cards Owned</div>
              <div className="tu-stat-value">{totalCardsOwned}</div>
            </div>
            <div className="tu-stat">
              <div className="tu-stat-label">Unique Owned</div>
              <div className="tu-stat-value">{totalUniqueCards}</div>
            </div>
            <div className="tu-stat">
              <div className="tu-stat-label">Collection Value</div>
              <div className="tu-stat-value">${totalValue.toFixed(2)}</div>
            </div>
            <div className="tu-stat">
              <div className="tu-stat-label">Price Refresh</div>
              <div className="tu-stat-value" style={{ fontSize: "19px" }}>{lastRefreshLabel}</div>
            </div>
          </div>

          {highest ? (
            <div style={{ color: "var(--muted)", marginTop: "18px" }}>
              Highest Value Card: <strong style={{ color: "var(--text)" }}>{highest.card?.name}</strong> ({highest.card?.variant}) — ${(
                Number(highest.card?.price || 0) * Number(highest.quantity || 0)
              ).toFixed(2)}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <Link href="/sets" className="tu-link-button">Browse Sets</Link>
            <Link href="/collection" className="tu-link-button secondary">View Collection</Link>
            <Link href="/analytics" className="tu-link-button secondary">Analytics</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
