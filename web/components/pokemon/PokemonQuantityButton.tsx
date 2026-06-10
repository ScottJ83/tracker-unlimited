"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PokemonQuantityButton({
  printId,
  quantity,
}: {
  printId: string;
  quantity: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function change(delta: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const next = Math.max(0, Number(quantity || 0) + delta);

    const { data: existing } = await supabase
      .from("pokemon_collection_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("print_id", printId)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("pokemon_collection_entries")
        .update({ quantity: next, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("pokemon_collection_entries").insert({
        user_id: user.id,
        print_id: printId,
        quantity: next,
      });
    }

    router.refresh();
  }

  return (
    <div className="pkdx-qty">
      <button type="button" onClick={() => change(-1)}>-</button>
      <span>{quantity}</span>
      <button type="button" onClick={() => change(1)}>+</button>
    </div>
  );
}
