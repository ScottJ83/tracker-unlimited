import CollectionClient from "@/components/CollectionClient";
import { supabase } from "@/lib/supabase";

export default async function CollectionPage() {
  const userId = "81758ed6-6848-446a-9b57-f61e36fea5c9";

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
    .gt("quantity", 0);

  if (error) {
    return (
      <main>
        <h1>Collection</h1>
        <div>{error.message}</div>
      </main>
    );
  }

  return (
    <main>
      <h1 style={{ marginBottom: "18px" }}>Collection</h1>
      <CollectionClient data={data || []} userId={userId} />
    </main>
  );
}