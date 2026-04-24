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

export default async function CollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getAllCollectionWithCards(supabase, user.id);

  return (
    <main>
      <h1 style={{ marginBottom: "18px" }}>Collection</h1>
      <CollectionClient data={data || []} userId={user.id} />
    </main>
  );
}