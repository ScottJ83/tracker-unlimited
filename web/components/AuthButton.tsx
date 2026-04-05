"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email?: string | null;
};

export default function AuthButton({ email }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (email) {
    return (
      <div className="swu-auth">
        <span className="swu-auth-email">{email}</span>
        <button type="button" onClick={handleLogout} className="swu-nav-btn">
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="swu-auth">
      <Link href="/login" className="swu-nav-link swu-nav-link--button">
        Log In
      </Link>
      <Link href="/signup" className="swu-nav-link swu-nav-link--button">
        Sign Up
      </Link>
    </div>
  );
}