"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSessionFromUrl() {
      setError("");

      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace(/^#/, ""));

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setError(error.message);
          setReady(false);
          return;
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && type !== "recovery") {
        setError("This password reset link is invalid or has expired. Please request a new one.");
        setReady(false);
        return;
      }

      setReady(true);
    }

    loadSessionFromUrl();
  }, [supabase.auth]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated. Redirecting to login...");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
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
        <h1 style={{ marginBottom: "10px" }}>Choose New Password</h1>

        <p style={{ color: "#cbd5e1", lineHeight: 1.5, marginBottom: "18px" }}>
          Enter your new password below.
        </p>

        {ready ? (
          <form onSubmit={handleUpdate} style={{ display: "grid", gap: "12px" }}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : null}

        {message ? <div style={{ color: "#86efac", marginTop: "12px" }}>{message}</div> : null}
        {error ? <div style={{ color: "#fca5a5", marginTop: "12px" }}>{error}</div> : null}

        <div style={{ marginTop: "14px", color: "#cbd5e1" }}>
          <Link href="/forgot-password">Request a new reset link</Link>
        </div>
      </div>
    </main>
  );
}
