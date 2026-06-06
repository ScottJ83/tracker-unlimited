export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Account Databank</div>
        <h1 className="sw-page-title">Profile</h1>
        <div className="sw-page-subtitle">
          Update your username display and profile image. Login still uses your email.
        </div>
      </div>

      <section className="tu-profile-upload-card">
        <ProfilePhotoUploader
          userId={user.id}
          username={profile?.username || user.email || "Account"}
          currentAvatarUrl={profile?.avatar_url || null}
          currentAvatarPath={profile?.avatar_path || null}
        />
      </section>
    </main>
  );
}
