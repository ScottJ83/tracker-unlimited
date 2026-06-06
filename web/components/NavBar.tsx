import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "./AuthButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    displayName = profile?.username || user.email || "Account";
  }

  return (
    <header
      style={{
        borderBottom: "1px solid #334155",
        background: "rgba(11, 17, 32, 0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
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
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
          TRACKER UNLIMITED
        </Link>

        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <nav style={{ display: "flex", gap: "18px", color: "#cbd5e1", flexWrap: "wrap" }}>
            <Link href="/">Home</Link>
            <Link href="/sets">Sets</Link>
            <Link href="/collection">Collection</Link>
            <Link href="/cards">Cards</Link>
            <Link href="/decks">Decks</Link>
            <Link href="/missing">Missing</Link>
            <Link href="/wishlist">Wishlist</Link>
          </nav>

          <AuthButton email={displayName} />
        </div>
      </div>
    </header>
  );
}
