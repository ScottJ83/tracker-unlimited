import Link from "next/link";

function ArchiveCard({
  href,
  kicker,
  title,
  description,
  tone,
  badge,
}: {
  href: string;
  kicker: string;
  title: string;
  description: string;
  tone: "swu" | "pokemon";
  badge: string;
}) {
  const isPokemon = tone === "pokemon";

  return (
    <Link
      href={href}
      className={isPokemon ? "tu-archive-card tu-archive-card-pokemon" : "tu-archive-card tu-archive-card-swu"}
    >
      <div className="tu-archive-card-bg" />

      <div className="tu-archive-card-top">
        <div className="sw-kicker">{kicker}</div>
        <div className="tu-archive-badge">{badge}</div>
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

      {isPokemon ? (
        <div className="tu-pokemon-orbits" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className="tu-swu-stars" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      <div className="sw-button sw-button-primary" style={{ justifySelf: "start", position: "relative" }}>
        Open Archive
      </div>
    </Link>
  );
}

export default function TrackerUnlimitedHomePage() {
  return (
    <main>
      <section className="tu-archive-home">
        <div className="tu-archive-hero">
          <div className="sw-kicker">Universal Collection Archives</div>
          <h1>Tracker Unlimited</h1>
          <p>
            Choose your archive. Track collections, monitor completion, manage wishlists,
            build decks, and explore card databases across supported trading card games.
          </p>
        </div>

        <div className="tu-archive-grid">
          <ArchiveCard
            href="/swu"
            kicker="Original Archive"
            title="Star Wars Unlimited"
            description="Open the cinematic databank archive for Star Wars Unlimited cards, sets, collections, decks, wishlist, uncollected cards, and analytics."
            tone="swu"
            badge="SWU"
          />

          <ArchiveCard
            href="/pokemon"
            kicker="New Archive"
            title="Pokémon"
            description="Enter a Pokédex-inspired archive framework for regions, sets, Pokédex browsing, collection tracking, wishlists, decks, and analytics."
            tone="pokemon"
            badge="PKMN"
          />
        </div>

        <section className="tu-future-archives">
          <div className="sw-kicker">Future Ready</div>
          <p>Magic, Lorcana, One Piece, Yu-Gi-Oh, and more can join the archive later.</p>
        </section>
      </section>
    </main>
  );
}
