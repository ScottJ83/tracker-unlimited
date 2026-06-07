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
    ["Uncollected", "/missing"],
    ["Wishlist", "/wishlist"],
    ["Analytics", "/analytics"],
  ];

  return (
    <header className="tu-navbar">
      <div className="tu-navbar-top tu-navbar-top-compact">
        <div />

        <Link href="/" aria-label="Tracker Unlimited Home" className="sw-logo-wordmark">
          TRACKER<br />UNLIMITED
        </Link>

        <div className="tu-account-wrap tu-account-wrap-compact">
          {user ? (
            <Link href="/profile" className="tu-profile-nav-card" title="Profile">
              <span className="tu-profile-nav-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" />
                ) : (
                  <span>{String(displayName || "U").slice(0, 1).toUpperCase()}</span>
                )}
              </span>
              <span className="tu-profile-nav-text">
                <span className="tu-profile-nav-kicker">Profile</span>
                <span className="tu-profile-nav-name">{displayName}</span>
              </span>
            </Link>
          ) : null}
          <AuthButton email={null} />
        </div>
      </div>

      <div className="sw-divider" />

      <nav className="tu-nav-links">
        {navLinks.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
