import { createClient } from "@/lib/supabase/server";

export default async function UserDisplayName() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  return <span>{profile?.username || user.email || "Account"}</span>;
}
