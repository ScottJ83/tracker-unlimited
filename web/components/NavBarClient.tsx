"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "./AuthButton";

type NavBarClientProps = {
  userEmail: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

function ProfilePill({
  displayName,
  avatarUrl,
}: {
  displayName: string | null;
  avatarUrl: string | null;
}) {
  if (!displayName) return null;

  return (
    <Link href="/profile" title="Profile" className="tu-profile-pill">
      <span className="tu-profile-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" />
        ) : (
          <span className="tu-profile-initial">
            {String(displayName || "U").slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>

      <span className="tu-profile-text">
        <span className="tu-profile-label">Profile</span>
        <span className="tu-profile-name">{displayName}</span>
      </span>
    </Link>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="tu-nav-link">
      {label}
    </Link>
  );
}

function CollectionMenu({ base }: { base: "/swu" | "/pokemon" }) {
  return (
    <details style={{ position: "relative", display: "inline-block" }}>
      <summary className="tu-nav-link" style={{ listStyle: "none", cursor: "pointer" }}>
        Collection ▾
      </summary>

      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          minWidth: "190px",
          border: "1px solid rgba(246,241,229,0.16)",
          borderRadius: "12px",
          background:
            "linear-gradient(180deg, rgba(15,15,18,0.98), rgba(5,6,8,0.98))",
          boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
          padding: "10px",
          zIndex: 5000,
          display: "grid",
          gap: "8px",
          textAlign: "left",
        }}
      >
        <Link className="tu-nav-link" href={`${base}/collection`}>
          Collection
        </Link>
        <Link className="tu-nav-link" href={`${base}/uncollected`}>
          Uncollected
        </Link>
        <Link className="tu-nav-link" href={`${base}/wishlist`}>
          Wishlist
        </Link>
      </div>
    </details>
  );
}

export default function NavBarClient({
  userEmail,
  displayName,
  avatarUrl,
}: NavBarClientProps) {
  const pathname = usePathname();

  const isPokemon = pathname === "/pokemon" || pathname.startsWith("/pokemon/");
  const isSwu =
    pathname === "/swu" ||
    pathname.startsWith("/swu/") ||
    pathname === "/profile" ||
    pathname === "/choose-username";

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(246,241,229,0.12)",
        background: "rgba(5,6,8,0.88)",
        backdropFilter: "blur(12px)",
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
          <ProfilePill displayName={displayName} avatarUrl={avatarUrl} />
          <AuthButton email={userEmail} />
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
          fontWeight: 850,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
        }}
      >
        {isPokemon ? (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/pokemon" label="Home" />
            <NavLink href="/pokemon/pokedex" label="Pokédex" />
            <NavLink href="/pokemon/sets" label="Sets" />
            <NavLink href="/pokemon/regions" label="Regions" />
            <CollectionMenu base="/pokemon" />
            <NavLink href="/pokemon/decks" label="Decks" />
            <NavLink href="/pokemon/analytics" label="Analytics" />
            <NavLink href="/pokemon/about" label="About" />
          </>
        ) : isSwu ? (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/swu" label="Home" />
            <NavLink href="/swu/sets" label="Sets" />
            <CollectionMenu base="/swu" />
            <NavLink href="/swu/cards" label="Cards" />
            <NavLink href="/swu/decks" label="Decks" />
            <NavLink href="/swu/analytics" label="Analytics" />
            <NavLink href="/swu/about" label="About" />
          </>
        ) : (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/swu" label="Star Wars Unlimited" />
            <NavLink href="/pokemon" label="Pokémon" />
          </>
        )}
      </nav>
    </header>
  );
}
