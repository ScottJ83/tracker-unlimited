import { createClient } from "@/lib/supabase/server";

export async function GET() {
  return Response.json({ ok: true, route: "collection/update" });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { card_id, delta } = body;

    if (!card_id || typeof delta !== "number") {
      return Response.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const user_id = user.id;

    const { data: existing, error: findError } = await supabase
      .from("collection_entries")
      .select("*")
      .eq("user_id", user_id)
      .eq("card_id", card_id)
      .maybeSingle();

    if (findError) {
      return Response.json({ error: findError.message }, { status: 500 });
    }

    if (existing) {
      const newQuantity = Math.max(0, existing.quantity + delta);

      const { data: updated, error: updateError } = await supabase
        .from("collection_entries")
        .update({ quantity: newQuantity })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return Response.json({ error: updateError.message }, { status: 500 });
      }

      return Response.json({ ok: true, action: "updated", row: updated });
    }

    if (delta > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("collection_entries")
        .insert({
          user_id,
          card_id,
          quantity: 1,
        })
        .select()
        .single();

      if (insertError) {
        return Response.json({ error: insertError.message }, { status: 500 });
      }

      return Response.json({ ok: true, action: "inserted", row: inserted });
    }

    return Response.json({ ok: true, action: "noop" });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 }
    );
  }
}