export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistClient from "@/components/WishlistClient";

async function getAllWishlist(supabase: any, userId: string) {
  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("wishlist_entries")
      .select(`
        id,
        card_id,
        created_at,
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
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export default async function WishlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const wishlist = await getAllWishlist(supabase, user.id);

  return (
    <main>
      <h1 style={{ marginBottom: "18px" }}>Wishlist</h1>
      <WishlistClient data={wishlist || []} userId={user.id} />
    </main>
  );
}
