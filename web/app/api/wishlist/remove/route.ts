import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const wishlistId = body?.wishlistId;

  if (!wishlistId) {
    return NextResponse.json({ error: "Missing wishlistId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist_entries")
    .delete()
    .eq("id", wishlistId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
