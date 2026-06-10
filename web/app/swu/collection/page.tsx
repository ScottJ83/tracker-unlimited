import { redirect } from "next/navigation";
import CollectionClient from "@/components/CollectionClient";
import { createClient } from "@/lib/supabase/server";

async function getAllCollectionWithCards(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select(`
        id,
        quantity,
        card_id,
        cards (
          id,
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
          price,
          card_type,
          arena
        )
      `)
      .eq("user_id", userId)
      .gt("quantity", 0)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);

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

export default async function CollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const [data, lastPriceRefresh] = await Promise.all([
      getAllCollectionWithCards(supabase, user.id),
      getLastPriceRefresh(supabase),
    ]);

    return (
      <main>
        <div className="sw-page-header">
          <div className="sw-kicker">Collection Database</div>
          <h1 className="sw-page-title">Collection</h1>
          <div className="sw-page-subtitle">
            Review owned cards, quantities, variants, prices, and collection value.
          </div>
        </div>
        <CollectionClient
          data={data || []}
          userId={user.id}
          lastPriceRefresh={lastPriceRefresh}
        />
      </main>
    );
  } catch (error: any) {
    return (
      <main>
        <h1 className="sw-page-title">Collection</h1>
        <div className="sw-panel" style={{ padding: "18px", marginTop: "18px" }}>{error.message}</div>
      </main>
    );
  }
}
