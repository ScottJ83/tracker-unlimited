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

  const navLinks = [
    ["Home", "/"],
    ["Sets", "/sets"],
    ["Collection", "/collection"],
    ["Cards", "/cards"],
    ["Decks", "/decks"],
    ["Missing", "/missing"],
    ["Wishlist", "/wishlist"],
    ["Analytics", "/analytics"],
  ];

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "12px 24px 10px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#f5f5f5",
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          Tracker Unlimited
        </Link>

        <Link
          href="/"
          aria-label="Tracker Unlimited Home"
          style={{
            textAlign: "center",
            color: "#fff",
            fontWeight: 1000,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            fontSize: "22px",
            lineHeight: 0.85,
            textShadow: "0 0 14px rgba(255,255,255,0.25)",
          }}
        >
          STAR<br />WARS
        </Link>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "14px" }}>
          <AuthButton email={displayName} />
        </div>
      </div>

      <div className="sw-divider" />

      <nav
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "10px 24px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          color: "#cfcfcf",
          flexWrap: "wrap",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {navLinks.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            style={{
              paddingBottom: "4px",
              borderBottom: "1px solid transparent",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
