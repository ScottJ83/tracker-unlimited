import Link from "next/link";

function ArchiveCard({
  href,
  title,
  description,
  tone,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  tone: "swu" | "pokemon";
  badge: string;
}) {
  return (
    <Link href={href} className={`tu-hub-card tu-hub-card-${tone}`}>
      <div className="tu-hub-card-bg" />

      <div className="tu-hub-card-top">
        <div />
        <div className="tu-hub-badge">{badge}</div>
      </div>

      <h2>{title}</h2>
      <p>{description}</p>

      <div className="tu-hub-open">Open Archive</div>
    </Link>
  );
}

export default function TrackerUnlimitedHomePage() {
  return (
    <main className="tu-hub-page">
      <section className="tu-hub-hero">
        <div className="tu-hub-kicker">Universal Collection Archives</div>
        <h1>Tracker Unlimited</h1>
        <p>
          Choose your archive. Each game keeps its own identity while sharing the same
          collection, completion, wishlist, deck, and analytics platform.
        </p>
      </section>

      <section className="tu-hub-grid">
        <ArchiveCard
          href="/swu"
          title="Star Wars Unlimited"
          description="A cinematic databank archive for Star Wars Unlimited cards, sets, collections, decks, wishlist, uncollected cards, and analytics."
          tone="swu"
          badge="SWU"
        />

        <ArchiveCard
          href="/pokemon"
          title="Pokémon"
          description="A Pokédex-inspired archive for regions, sets, Pokédex browsing, collection tracking, wishlists, decks, and analytics."
          tone="pokemon"
          badge="PKMN"
        />
      </section>
    </main>
  );
}
