import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "./AuthButton";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    displayName = profile?.username || user.email || "Account";
    avatarUrl = profile?.avatar_url || null;
  }

  const navLinks = [
    ["Home", "/"],
    ["Sets", "/sets"],
    ["Collection", "/collection"],
    ["Cards", "/cards"],
    ["Decks", "/decks"],
    ["Uncollected", "/uncollected"],
    ["Wishlist", "/wishlist"],
    ["Analytics", "/analytics"],
  ];

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 2000,
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "12px 24px 8px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "18px",
          minHeight: "94px",
        }}
      >
        <div />

        <Link href="/" aria-label="Tracker Unlimited Home" className="sw-logo-wordmark">
          TRACKER<br />UNLIMITED
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
          }}
        >
          {user ? (
            <Link
              href="/profile"
              title="Profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "7px 10px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, rgba(2,6,12,0.72), rgba(8,18,35,0.54))",
                color: "#f5f5f5",
                maxWidth: "220px",
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                  borderRadius: "999px",
                  border: "1px solid rgba(245,197,66,0.62)",
                  background: "rgba(245,197,66,0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 0 20px rgba(245,197,66,0.12)",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "999px",
                      display: "block",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "#f5c542",
                      fontWeight: 900,
                      fontSize: "14px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {String(displayName || "U").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>

              <span
                style={{
                  minWidth: 0,
                  display: "grid",
                  gap: "1px",
                  lineHeight: 1.05,
                }}
              >
                <span
                  style={{
                    color: "#f5c542",
                    fontSize: "9px",
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Profile
                </span>
                <span
                  style={{
                    color: "#f5f5f5",
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "150px",
                  }}
                >
                  {displayName}
                </span>
              </span>
            </Link>
          ) : null}

          <AuthButton email={user?.email || null} />
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
          alignItems: "center",
          gap: "24px",
          color: "#cfcfcf",
          flexWrap: "wrap",
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {navLinks.map(([label, href]) => (
          <Link key={href} href={href} className="tu-nav-link">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
