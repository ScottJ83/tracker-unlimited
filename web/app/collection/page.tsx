import CollectionClient from "@/components/CollectionClient";
import { supabase } from "@/lib/supabase";

async function getAllCollectionWithCards(userId: string) {
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
          name,
          subtitle,
          set_code,
          card_number,
          variant,
          aspect,
          price
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

export default async function CollectionPage() {
  const userId = "81758ed6-6848-446a-9b57-f61e36fea5c9";

  try {
    const data = await getAllCollectionWithCards(userId);

    return (
      <main>
        <h1 style={{ marginBottom: "18px" }}>Collection</h1>
        <CollectionClient data={data || []} userId={userId} />
      </main>
    );
  } catch (error: any) {
    return (
      <main>
        <h1>Collection</h1>
        <div>{error.message}</div>
      </main>
    );
  }
}