"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton({
  email,
  avatarUrl,
}: {
  email: string | null;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!email) {
    return (
      <Link href="/login" className="sw-button">
        Log In
      </Link>
    );
  }

  const initial = String(email || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Link href="/profile" className="tu-profile-link" title="Edit profile">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="tu-avatar" />
        ) : (
          <span className="tu-avatar-placeholder">{initial}</span>
        )}
        <span>{email}</span>
      </Link>

      <button type="button" onClick={handleLogout} className="sw-button">
        Log Out
      </button>
    </div>
  );
}
