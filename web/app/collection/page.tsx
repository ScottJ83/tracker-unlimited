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
      traits,
      rarity,
      artist,
      cost,
      power,
      hp,
      front_text,
      front_art,
      price
    )
  `)
  .eq("user_id", user.id)
  .gt("quantity", 0);