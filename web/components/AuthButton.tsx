"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton({ email }: { email: string | null }) {
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

  return (
    <button type="button" onClick={handleLogout} className="sw-button">
      Log Out
    </button>
  );
}
