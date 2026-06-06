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
  const username = String(body?.username || "").trim();

  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-24 characters and only use letters, numbers, or underscores." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      username,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
