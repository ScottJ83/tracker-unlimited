"use client";

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
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>{email}</span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            borderRadius: "10px",
            border: "1px solid #475569",
            background: "#1e293b",
            color: "#e5edf7",
            cursor: "pointer",
          }}
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <a href="/login">Log In</a>
      <a href="/signup">Sign Up</a>
    </div>
  );
}