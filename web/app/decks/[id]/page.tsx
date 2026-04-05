export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeckEditorClient from "@/components/DeckEditorClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DeckDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select(`
      id,
      name,
      user_id,
      leader_card_id,
      base_card_id,
      created_at,
      updated_at,
      leader_card:leader_card_id (
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
      ),
      base_card:base_card_id (
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (deckError || !deck) {
    redirect("/decks");
  }

  const { data: collection, error: collectionError } = await supabase
    .from("collection_entries")
    .select(`
      id,
      quantity,
      card_id,
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
    .eq("user_id", user.id)
    .gt("quantity", 0);

  const { data: deckCards, error: deckCardsError } = await supabase
    .from("deck_cards")
    .select(`
      id,
      deck_id,
      card_id,
      quantity,
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
    .eq("deck_id", id)
    .order("card_id", { ascending: true });

  if (collectionError || deckCardsError) {
    return (
      <main>
        <h1 style={{ marginBottom: "18px" }}>Deck Editor</h1>
        <div
          style={{
            border: "1px solid #7f1d1d",
            background: "#2a0f14",
            color: "#fecaca",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          {collectionError?.message || deckCardsError?.message || "Failed to load deck editor."}
        </div>
      </main>
    );
  }

  return (
    <main>
<DeckEditorClient
  deck={deck}
  collectionEntries={collection || []}
  initialDeckCards={deckCards || []}
/>
    </main>
  );
}