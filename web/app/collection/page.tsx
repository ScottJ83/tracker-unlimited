import { redirect } from "next/navigation";
import CollectionClient from "@/components/CollectionClient";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
        rarity,
        artist,
        front_text,
        front_art,
        price
      )
    `)
    .eq("user_id", user.id)
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
      <CollectionClient data={data || []} />
    </main>
  );
}