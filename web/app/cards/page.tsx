import { redirect } from "next/navigation";
import SetClient from "@/components/SetClient";
import { createClient } from "@/lib/supabase/server";

export default async function CardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("set_code", { ascending: true })
    .order("card_number", { ascending: true });

  const { data: collection } = await supabase
    .from("collection_entries")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return <main style={{ padding: "20px" }}>Error loading cards.</main>;
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "18px" }}>All Cards</h1>
      <SetClient cards={cards} collection={collection} />
    </main>
  );
}