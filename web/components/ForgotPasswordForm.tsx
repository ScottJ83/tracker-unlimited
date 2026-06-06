"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setLoading(false);
      setError("Enter your email address.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${getSiteUrl()}/update-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox for the reset link.");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
      <label style={{ display: "grid", gap: "6px" }}>
        <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700 }}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
            fontSize: "16px",
          }}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: loading ? "#0f172a" : "#1e293b",
          color: loading ? "#64748b" : "#e5edf7",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "Sending..." : "Send Reset Email"}
      </button>

      {message ? (
        <div
          style={{
            border: "1px solid #166534",
            background: "#052e16",
            color: "#bbf7d0",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            border: "1px solid #7f1d1d",
            background: "#2a0f14",
            color: "#fecaca",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      ) : null}
    </form>
  );
}
