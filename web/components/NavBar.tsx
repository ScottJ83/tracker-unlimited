import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "./AuthButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      style={{
        borderBottom: "1px solid #1f2937",
        background: "#05070d",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ fontWeight: 800, letterSpacing: "0.12em" }}>
          TRACKER UNLIMITED
        </Link>

        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <nav style={{ display: "flex", gap: "20px", color: "#94a3b8" }}>
            <Link href="/">Home</Link>
            <Link href="/sets">Sets</Link>
            <Link href="/collection">Collection</Link>
            <Link href="/cards">Cards</Link>
          </nav>

          <AuthButton email={user?.email ?? null} />
        </div>
      </div>
    </header>
  );
}