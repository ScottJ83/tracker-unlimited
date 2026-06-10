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

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(8,8,8,0.72)",
        padding: "16px",
        minHeight: "108px",
      }}
    >
      <div style={{ color: "#9a9a9a", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {label}
      </div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: "26px", marginTop: "8px" }}>{value}</div>
      {sub ? <div style={{ color: "#bfbfbf", fontSize: "13px", marginTop: "6px" }}>{sub}</div> : null}
    </div>
  );
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
          minHeight: "calc(100vh - 190px)",
          border: "1px solid rgba(255,255,255,0.16)",
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.98) 0%, rgba(0,6,18,0.80) 46%, rgba(0,0,0,0.38) 100%), radial-gradient(circle at 18% 82%, rgba(12,54,105,0.32), transparent 30%), radial-gradient(circle at 76% 42%, rgba(245,197,66,0.13), transparent 25%), linear-gradient(180deg, rgba(15,29,52,0.54), rgba(0,0,0,0.96))",
          boxShadow: "0 24px 90px rgba(0,0,0,0.62)",
          padding: "54px 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 46%, rgba(255,255,255,0.14), transparent 1px), radial-gradient(circle at 62% 18%, rgba(255,255,255,0.10), transparent 1px), radial-gradient(circle at 89% 73%, rgba(255,255,255,0.10), transparent 1px)",
            opacity: 0.8,
          }}
        />

        <div style={{ position: "relative", maxWidth: "920px" }}>
          <div className="sw-kicker">Star Wars Unlimited</div>
          <h1
            style={{
              fontSize: "clamp(44px, 7vw, 92px)",
              lineHeight: 0.92,
              margin: "16px 0 18px",
              maxWidth: "850px",
              color: "#fff",
              textShadow: "0 0 24px rgba(255,255,255,0.18)",
            }}
          >
            Tracker<br />Unlimited
          </h1>
          <div style={{ width: "92px", height: "6px", background: "var(--accent)", marginBottom: "28px" }} />
          <p style={{ color: "#d5d5d5", lineHeight: 1.75, fontSize: "18px", maxWidth: "680px" }}>
            Track your collection, monitor set completion, manage wishlists, and build decks for Star Wars Unlimited
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
              marginTop: "34px",
              maxWidth: "920px",
            }}
          >
            <StatBox label="Cards Owned" value={String(totalCardsOwned)} />
            <StatBox label="Unique Owned" value={String(totalUniqueCards)} />
            <StatBox label="Collection Value" value={`$${totalValue.toFixed(2)}`} />
            <StatBox label="Price Refresh" value={lastRefreshLabel} />
            <StatBox
              label="Highest Value"
              value={highest ? `$${(Number(highest.card?.price || 0) * Number(highest.quantity || 0)).toFixed(2)}` : "-"}
              sub={highest ? `${highest.card?.name} (${highest.card?.variant})` : undefined}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "30px", flexWrap: "wrap" }}>
            <Link href="/swu/sets" className="sw-button sw-button-primary">
              Browse Sets
            </Link>
            <Link href="/swu/collection" className="sw-button">
              View Collection
            </Link>
            <Link href="/swu/analytics" className="sw-button">
              Analytics
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
