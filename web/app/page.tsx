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
  tone: "swu" | "pokemon" | "mtg";
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
      <style dangerouslySetInnerHTML={{ __html: `
.tu-hub-card-mtg{background:linear-gradient(135deg,rgba(32,24,16,.92),rgba(8,7,5,.92));border-color:rgba(216,166,79,.42);box-shadow:0 24px 70px rgba(0,0,0,.35)}.tu-hub-card-mtg .tu-hub-card-bg{background:radial-gradient(circle at 75% 15%,rgba(241,195,108,.24),transparent 35%),radial-gradient(circle at 20% 85%,rgba(111,66,193,.16),transparent 35%)}.tu-hub-card-mtg .tu-hub-badge{background:linear-gradient(180deg,#f1c36c,#a66c20);color:#120e08;border-color:rgba(245,234,215,.5)}.tu-hub-card-mtg h2{color:#f5ead7;text-shadow:0 0 22px rgba(216,166,79,.22)}.tu-hub-card-mtg p{color:#d9cab0}.tu-hub-card-mtg .tu-hub-open{background:linear-gradient(180deg,#f1c36c,#a66c20);color:#120e08;border-color:rgba(245,234,215,.45)}
` }} />
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

        <ArchiveCard
          href="/mtg"
          title="Magic: The Gathering"
          description="A dark fantasy spell archive for MTG sets, cards, printings, foils, promos, variants, collection tracking, decks, and analytics."
          tone="mtg"
          badge="MTG"
        />
      </section>
    </main>
  );
}
