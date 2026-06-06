import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUsername() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.username) {
    redirect("/choose-username");
  }

  return { user, profile };
}
