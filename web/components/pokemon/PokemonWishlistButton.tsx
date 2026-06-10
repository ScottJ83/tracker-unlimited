"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PokemonWishlistButton({
  printId,
  wished,
}: {
  printId: string;
  wished: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function toggle() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (wished) {
      await supabase
        .from("pokemon_wishlist_entries")
        .delete()
        .eq("user_id", user.id)
        .eq("print_id", printId);
    } else {
      await supabase
        .from("pokemon_wishlist_entries")
        .insert({ user_id: user.id, print_id: printId });
    }

    router.refresh();
  }

  return (
    <button type="button" className={wished ? "pkdx-wishlist-button pkdx-wished" : "pkdx-wishlist-button"} onClick={toggle}>
      {wished ? "Wanted" : "Want"}
    </button>
  );
}
