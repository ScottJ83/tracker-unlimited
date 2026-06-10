import { createClient } from "@/lib/supabase/server";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    displayName = profile?.username || user.email || "Account";
    avatarUrl = profile?.avatar_url || null;
  }

  return (
    <NavBarClient
      userEmail={user?.email || null}
      displayName={displayName}
      avatarUrl={avatarUrl}
    />
  );
}
