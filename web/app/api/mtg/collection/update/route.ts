import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const printingId = String(body?.printingId || "").trim();
  const action = String(body?.action || "").trim();

  if (!printingId || !["increment", "decrement", "set"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: existing, error: readError } = await supabase
    .from("mtg_collection_entries")
    .select("id, quantity, foil_quantity, etched_quantity")
    .eq("user_id", user.id)
    .eq("printing_id", printingId)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const current = Number(existing?.quantity || 0);
  let next = current;

  if (action === "increment") next = current + 1;
  if (action === "decrement") next = Math.max(0, current - 1);
  if (action === "set") next = Math.max(0, Number(body?.value || 0));

  const row = {
    user_id: user.id,
    printing_id: printingId,
    quantity: next,
    foil_quantity: 0,
    etched_quantity: 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("mtg_collection_entries")
    .upsert(row, { onConflict: "user_id,printing_id" })
    .select("id, quantity, foil_quantity, etched_quantity")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entry: data });
}
