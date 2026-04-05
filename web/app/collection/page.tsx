import { redirect } from "next/navigation";
import CollectionClient from "@/components/CollectionClient";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("collection_entries")
    .select(`
      id,
      quantity,
      card_id,
      cards (
        name,
        subtitle,
        set_code,
        card_number,
        variant,
        aspect,
        traits,
        rarity,
        artist,
        cost,
        power,
        hp,
        front_text,
        front_art,
        price
      )
    `)
    .eq("user_id", user.id)
    .gt("quantity", 0);

  const rows = (data || []).map((item: any) => ({
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

  return (
    <main>
      <h1 className="page-title">Collection</h1>

      <div className="panel">
        <div className="stats-grid">
          <div>
            <div className="stat-label">Total Cards</div>
            <div className="stat-value">{totalCardsOwned}</div>
          </div>

          <div>
            <div className="stat-label">Unique Cards</div>
            <div className="stat-value">{totalUniqueCards}</div>
          </div>

          <div>
            <div className="stat-label">Collection Value</div>
            <div className="stat-value">
              ${totalValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <CollectionClient data={data || []} />
    </main>
  );
}