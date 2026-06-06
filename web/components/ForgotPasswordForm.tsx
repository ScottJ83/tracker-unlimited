"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function getSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const redirectTo = `${getSiteUrl()}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("If an account exists for that email, a password reset link has been sent.");
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
        <h1 style={{ marginBottom: "10px" }}>Reset Password</h1>

        <p style={{ color: "#cbd5e1", lineHeight: 1.5, marginBottom: "18px" }}>
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>

        <form onSubmit={handleReset} style={{ display: "grid", gap: "12px" }}>
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
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message ? <div style={{ color: "#86efac", marginTop: "12px" }}>{message}</div> : null}
        {error ? <div style={{ color: "#fca5a5", marginTop: "12px" }}>{error}</div> : null}

        <div style={{ marginTop: "14px", color: "#cbd5e1" }}>
          Remember your password? <Link href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
