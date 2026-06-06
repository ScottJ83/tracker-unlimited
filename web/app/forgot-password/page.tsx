import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "28px",
          background: "linear-gradient(180deg, #172033, #111827)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ color: "#7dd3fc", fontWeight: 700, letterSpacing: "0.12em" }}>
          TRACKER UNLIMITED
        </div>

        <h1 style={{ fontSize: "32px", margin: "12px 0 8px 0" }}>Reset Password</h1>

        <p style={{ color: "#cbd5e1", lineHeight: 1.6, marginBottom: "20px" }}>
          Enter your account email and we’ll send you a password reset link.
        </p>

        <ForgotPasswordForm />

        <div style={{ marginTop: "18px", fontSize: "14px", color: "#94a3b8" }}>
          Remembered your password?{" "}
          <Link href="/login" style={{ color: "#7dd3fc", fontWeight: 700 }}>
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
