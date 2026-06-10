export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import SetClient from "@/components/SetClient";
import { createClient } from "@/lib/supabase/server";

async function getAllCards(supabase: any) {
  let allCards: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + pageSize - 1)
      .order("set_code", { ascending: true })
      .order("card_number", { ascending: true });

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

export default async function CardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cards, collection] = await Promise.all([
    getAllCards(supabase),
    getAllCollection(supabase, user.id),
  ]);

  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Card Databank</div>
        <h1 className="sw-page-title">All Cards</h1>
        <div className="sw-page-subtitle">
          Search every imported card and variant across your Tracker Unlimited database.
        </div>
      </div>
      <SetClient cards={cards} collection={collection} userId={user.id} />
    </main>
  );
}
