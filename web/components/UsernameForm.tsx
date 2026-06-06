"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UsernameForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveUsername(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();

    if (!/^[A-Za-z0-9_]{3,24}$/.test(cleanUsername)) {
      setError("Username must be 3-24 characters and only use letters, numbers, or underscores.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        username: cleanUsername,
      },
      {
        onConflict: "user_id",
      }
    );

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setError("That username is already taken.");
        return;
      }

      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={saveUsername} style={{ display: "grid", gap: "12px" }}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "#e5edf7",
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "#e5edf7",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "Saving..." : "Save Username"}
      </button>

      {error ? <div style={{ color: "#fca5a5" }}>{error}</div> : null}
    </form>
  );
}
