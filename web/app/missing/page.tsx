export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MissingCardsClient from "@/components/MissingCardsClient";

async function getAllCards(supabase: any) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

async function getAllCollection(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select("card_id, quantity")
      .eq("user_id", userId)
      .gt("quantity", 0)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

async function getAllWishlist(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("wishlist_entries")
      .select("card_id")
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

export default async function MissingCardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cards, collection, wishlist] = await Promise.all([
    getAllCards(supabase),
    getAllCollection(supabase, user.id),
    getAllWishlist(supabase, user.id),
  ]);

  const ownedIds = new Set(collection.map((item: any) => item.card_id));
  const wantedIds = new Set(wishlist.map((item: any) => item.card_id));
  const missingCards = cards.filter((card: any) => !ownedIds.has(card.id));

  return (
    <main>
      <div className="tu-page-kicker">Hidden Archive</div>
      <h1>Missing Cards</h1>
      <p className="tu-page-subtitle">Missing card details are hidden by default to avoid spoilers. Reveal the archive when you're ready.</p>
      <MissingCardsClient cards={missingCards} wantedIds={Array.from(wantedIds)} />
    </main>
  );
}
