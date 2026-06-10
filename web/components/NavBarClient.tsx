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
        background: "linear-gradient(135deg, rgba(2,6,12,0.72), rgba(8,18,35,0.54))",
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

      <span style={{ minWidth: 0, display: "grid", gap: "1px", lineHeight: 1.05 }}>
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
    <details
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <summary
        className="tu-nav-link"
        style={{
          listStyle: "none",
          cursor: "pointer",
        }}
      >
        Collection ▾
      </summary>
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          minWidth: "190px",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "12px",
          background:
            "linear-gradient(180deg, rgba(5,8,14,0.98), rgba(0,0,0,0.96))",
          boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
          padding: "10px",
          zIndex: 5000,
          display: "grid",
          gap: "8px",
          textAlign: "left",
        }}
      >
        <Link className="tu-nav-link" href={`${base}/collection`}>Collection</Link>
        <Link className="tu-nav-link" href={`${base}/uncollected`}>Uncollected</Link>
        <Link className="tu-nav-link" href={`${base}/wishlist`}>Wishlist</Link>
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
          fontWeight: 900,
          letterSpacing: "0.12em",
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
