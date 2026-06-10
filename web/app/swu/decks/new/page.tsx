import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewDeckPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      name: "New Deck",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/swu/decks");
  }

  redirect(`/swu/decks/${data.id}`);
}