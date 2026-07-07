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

function CollectionMenu({ base }: { base: "/swu" | "/pokemon" | "/mtg" }) {
  return (
    <details className="tu-nav-menu">
      <summary className="tu-nav-link">Collection ▾</summary>

      <div className="tu-nav-dropdown">
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
      </div>
    </details>
  );
}

function DeckMenu({ base }: { base: "/swu" | "/mtg" | "/pokemon" }) {
  if (base === "/swu") {
    return (
      <details className="tu-nav-menu">
        <summary className="tu-nav-link">Decks ▾</summary>
        <div className="tu-nav-dropdown">
          <Link className="tu-nav-link" href="/swu/decks">My Decks</Link>
          <Link className="tu-nav-link" href="/swu/decks/premade">Pre-Made Decks</Link>
        </div>
      </details>
    );
  }

  return <NavLink href={`${base}/decks`} label="Decks" />;
}

export default function NavBarClient({
  userEmail,
  displayName,
  avatarUrl,
}: NavBarClientProps) {
  const pathname = usePathname();

  const isPokemon = pathname === "/pokemon" || pathname.startsWith("/pokemon/");
  const isMtg = pathname === "/mtg" || pathname.startsWith("/mtg/");
  const isSwu =
    pathname === "/swu" ||
    pathname.startsWith("/swu/") ||
    pathname === "/profile" ||
    pathname === "/choose-username";

  const headerClassName = isPokemon
    ? "tu-site-header tu-header-pokemon"
    : isMtg
      ? "tu-site-header tu-header-mtg"
      : isSwu
        ? "tu-site-header tu-header-swu"
        : "tu-site-header tu-header-home";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
.tu-site-header{border-bottom:1px solid rgba(246,241,229,.12);background:rgba(5,6,8,.88);backdrop-filter:blur(12px);position:sticky;top:0;z-index:2000}.tu-header-main{max-width:1320px;margin:0 auto;padding:12px 24px 8px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;min-height:94px}.tu-header-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;min-width:0}.tu-main-nav{max-width:1320px;margin:0 auto;padding:10px 24px;display:flex;justify-content:center;align-items:center;gap:24px;color:#cfcfcf;flex-wrap:wrap;font-size:12px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}.tu-nav-menu{position:relative;display:inline-block}.tu-nav-menu>summary{list-style:none;cursor:pointer}.tu-nav-menu>summary::-webkit-details-marker{display:none}.tu-nav-dropdown{position:absolute;top:30px;left:50%;transform:translateX(-50%);min-width:190px;border:1px solid rgba(246,241,229,.16);border-radius:12px;background:linear-gradient(180deg,rgba(15,15,18,.98),rgba(5,6,8,.98));box-shadow:0 20px 70px rgba(0,0,0,.55);padding:10px;z-index:5000;display:grid;gap:8px;text-align:left}.tu-header-mtg{background:linear-gradient(180deg,#1b140d,#090705 58%,#141009);border-bottom:3px solid rgba(216,166,79,.55);box-shadow:0 16px 42px rgba(0,0,0,.42)}.tu-header-mtg .sw-logo-wordmark{color:#f5ead7;text-shadow:0 0 22px rgba(216,166,79,.28),0 2px 0 #000}.tu-header-mtg .sw-divider{height:4px;background:linear-gradient(90deg,transparent,#a66c20,#f1c36c,#a66c20,transparent)}.tu-header-mtg .tu-main-nav{background:linear-gradient(180deg,rgba(32,24,16,.75),rgba(8,7,5,.62));border:1px solid rgba(216,166,79,.20);border-radius:0 0 18px 18px;gap:12px}.tu-header-mtg .tu-nav-link{color:#f5ead7;border:1px solid rgba(216,166,79,.28);border-radius:10px;padding:8px 12px;background:rgba(255,255,255,.035);box-shadow:0 6px 18px rgba(0,0,0,.18);text-decoration:none}.tu-header-mtg .tu-nav-link:hover{color:#120e08;background:linear-gradient(180deg,#f1c36c,#a66c20);border-color:rgba(241,195,108,.88);transform:translateY(-1px)}.tu-header-mtg .tu-profile-pill,.tu-header-mtg .sw-button{border-radius:10px;border:1px solid rgba(216,166,79,.48);background:linear-gradient(180deg,rgba(245,234,215,.10),rgba(166,108,32,.18));color:#f5ead7;box-shadow:0 10px 28px rgba(0,0,0,.26);text-decoration:none}.tu-header-mtg .tu-profile-label{color:#d8a64f}.tu-header-mtg .tu-profile-name,.tu-header-mtg .tu-profile-initial{color:#f5ead7}.tu-header-mtg .tu-profile-avatar{border-radius:8px;border:1px solid rgba(216,166,79,.6);background:radial-gradient(circle,#f1c36c,#a66c20 45%,#120e08)}
` }} />
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
            <DeckMenu base="/pokemon" />
            <NavLink href="/pokemon/analytics" label="Analytics" />
            <NavLink href="/pokemon/about" label="About" />
          </>
        ) : isMtg ? (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/mtg" label="Home" />
            <NavLink href="/mtg/sets" label="Sets" />
            <NavLink href="/mtg/cards" label="Cards" />
            <CollectionMenu base="/mtg" />
            <DeckMenu base="/mtg" />
            <NavLink href="/mtg/analytics" label="Analytics" />
            <NavLink href="/mtg/about" label="About" />
          </>
        ) : isSwu ? (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/swu" label="Home" />
            <NavLink href="/swu/sets" label="Sets" />
            <CollectionMenu base="/swu" />
            <NavLink href="/swu/cards" label="Cards" />
            <DeckMenu base="/swu" />
            <NavLink href="/swu/analytics" label="Analytics" />
            <NavLink href="/swu/about" label="About" />
          </>
        ) : (
          <>
            <NavLink href="/" label="Archives" />
            <NavLink href="/swu" label="Star Wars Unlimited" />
            <NavLink href="/pokemon" label="Pokémon" />
            <NavLink href="/mtg" label="Magic" />
          </>
        )}
      </nav>
    </header>
    </>
  );
}
