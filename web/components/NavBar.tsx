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
        borderBottom: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.94), rgba(0,0,0,0.86))",
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
          padding: "14px 24px 8px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div />

        <Link
          href="/"
          aria-label="Tracker Unlimited Home"
          className="sw-logo-wordmark"
        >
          TRACKER<br />UNLIMITED
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
            minWidth: 0,
          }}
        >
          <AuthButton email={displayName} />
        </div>
      </div>

      <div className="sw-divider" />

      <nav
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "10px 24px 11px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          color: "#cfcfcf",
          flexWrap: "wrap",
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "0.14em",
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
