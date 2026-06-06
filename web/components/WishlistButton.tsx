"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WishlistButton({
  cardId,
  initialWanted = false,
}: {
  cardId: string;
  initialWanted?: boolean;
}) {
  const supabase = createClient();
  const [wanted, setWanted] = useState(initialWanted);
  const [loading, setLoading] = useState(false);

  async function toggleWanted() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (wanted) {
      const { error } = await supabase
        .from("wishlist_entries")
        .delete()
        .eq("user_id", user.id)
        .eq("card_id", cardId);

      if (!error) setWanted(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("wishlist_entries").upsert(
      {
        user_id: user.id,
        card_id: cardId,
      },
      {
        onConflict: "user_id,card_id",
        ignoreDuplicates: false,
      }
    );

    if (!error) setWanted(true);
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleWanted}
      disabled={loading}
      style={{
        padding: "7px 10px",
        borderRadius: "10px",
        border: wanted ? "1px solid #facc15" : "1px solid #475569",
        background: wanted ? "#2a210f" : "#1e293b",
        color: wanted ? "#fde68a" : "#e5edf7",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {loading ? "Saving..." : wanted ? "Wanted ✓" : "Want"}
    </button>
  );
}
