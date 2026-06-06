"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) {
        setReady(true);
      }
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    checkSession();

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters.");
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

    setMessage("Password updated successfully. Redirecting to login...");

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
      {!ready ? (
        <div
          style={{
            border: "1px solid #92400e",
            background: "#2a1a0a",
            color: "#fed7aa",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "14px",
          }}
        >
          Waiting for password reset session. If this does not change, open the reset link from your email again.
        </div>
      ) : null}

      <label style={{ display: "grid", gap: "6px" }}>
        <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700 }}>New Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
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

      <label style={{ display: "grid", gap: "6px" }}>
        <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700 }}>Confirm Password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          autoComplete="new-password"
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
        disabled={loading || !ready}
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: loading || !ready ? "#0f172a" : "#1e293b",
          color: loading || !ready ? "#64748b" : "#e5edf7",
          cursor: loading || !ready ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "Updating..." : "Update Password"}
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
