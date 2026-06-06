export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetsClient from "@/components/SetsClient";

async function getAllCards(supabase: any) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allCards = [...allCards, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allCards;
}

async function getAllCollection(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select("*")
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export default async function SetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sets, error } = await supabase.from("sets").select("*");

  if (error) {
    return <main>Error loading sets: {error.message}</main>;
  }

  const cards = await getAllCards(supabase);
  const collection = await getAllCollection(supabase, user.id);

  return (
    <SetsClient
      sets={sets || []}
      cards={cards || []}
      collection={collection || []}
    />
  );
}
