"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Account created. You can log in now.");
    router.push("/login");
    router.refresh();
  }

  return (
    <main style={{ padding: "24px" }}>
      <div
        style={{
          maxWidth: "420px",
          margin: "40px auto",
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "24px",
          background: "#111827",
        }}
      >
        <h1 style={{ marginBottom: "18px" }}>Sign Up</h1>

        <form onSubmit={handleSignup} style={{ display: "grid", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e5edf7",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {error ? <div style={{ color: "#fca5a5", marginTop: "12px" }}>{error}</div> : null}
        {message ? <div style={{ color: "#86efac", marginTop: "12px" }}>{message}</div> : null}

        <div style={{ marginTop: "14px", color: "#cbd5e1" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}