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