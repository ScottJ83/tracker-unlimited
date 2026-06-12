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

function NavMenu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details className="tu-nav-menu">
      <summary className="tu-nav-link">{label} ▾</summary>
      <div className="tu-nav-dropdown">{children}</div>
    </details>
  );
}

function CollectionMenu({ base }: { base: "/swu" | "/pokemon" }) {
  return (
    <NavMenu label="Collection">
      <Link className="tu-nav-link" href={`${base}/collection`}>
        Collection
      </Link>

      {base === "/swu" ? (
        <>
          <Link className="tu-nav-link" href={`${base}/uncollected`}>
            Uncollected
          </Link>
          <Link className="tu-nav-link" href={`${base}/wishlist`}>
            Wishlist
          </Link>
        </>
      ) : null}
    </NavMenu>
  );
}

function DecksMenu({ base }: { base: "/swu" | "/pokemon" }) {
  if (base === "/pokemon") {
    return <NavLink href="/pokemon/decks" label="Decks" />;
  }

  return (
    <NavMenu label="Decks">
      <Link className="tu-nav-link" href="/swu/decks">
        My Decks
      </Link>
      <Link className="tu-nav-link" href="/swu/decks/premade">
        Pre-Made Decks
      </Link>
    </NavMenu>
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

  const headerClassName = isPokemon
    ? "tu-site-header tu-header-pokemon"
    : isSwu
      ? "tu-site-header tu-header-swu"
      : "tu-site-header tu-header-home";

  return (
    <header className={headerClassName}>
      <div className="tu-header-main">
        <div />

        <Link href="/" aria-label="Tracker Unlimited Home" className="sw-logo-wordmark">
          TRACKER<br />UNLIMITED
        </Link>

        <div className="tu-header-actions">
          <ProfilePill displayName={displayName} avatarUrl={avatarUrl} />
          <AuthButton email={userEmail} />
        </div>
      </div>

      <div className="sw-divider" />

      <nav className="tu-main-nav">
        {isPokemon ? (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/pokemon" label="Home" />
            <NavLink href="/pokemon/pokedex" label="Pokédex" />
            <NavLink href="/pokemon/sets" label="Sets" />
            <NavLink href="/pokemon/regions" label="Regions" />
            <CollectionMenu base="/pokemon" />
            <DecksMenu base="/pokemon" />
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
            <DecksMenu base="/swu" />
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
