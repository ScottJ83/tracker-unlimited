import Link from "next/link";

const archives = [
  {
    href: "/swu",
    label: "Active Archive",
    title: "Star Wars Unlimited",
    description:
      "Cards, sets, collection tracking, decks, wishlist, uncollected cards, values, and analytics.",
    code: "SWU",
    tone: "swu",
  },
  {
    href: "/pokemon",
    label: "Framework Archive",
    title: "Pokémon",
    description:
      "Pokédex, regions, sets, collection tracking, variants, wishlists, decks, and future master completion.",
    code: "PKMN",
    tone: "pokemon",
  },
];

function ArchiveTile({ archive }: { archive: (typeof archives)[number] }) {
  return (
    <Link href={archive.href} className={`tu-vault-tile tu-vault-tile-${archive.tone}`}>
      <div className="tu-vault-tile-glow" />

      <div className="tu-vault-tile-top">
        <span>{archive.label}</span>
        <strong>{archive.code}</strong>
      </div>

      <div>
        <h2>{archive.title}</h2>
        <p>{archive.description}</p>
      </div>

      <div className="tu-vault-tile-bottom">
        <span>Open Archive</span>
        <span className="tu-vault-arrow">→</span>
      </div>
    </Link>
  );
}

export default function TrackerUnlimitedHomePage() {
  return (
    <main className="tu-vault-page">
      <section className="tu-vault-hero">
        <div className="tu-vault-kicker">Collection Archive Platform</div>

        <h1>
          Tracker
          <span>Unlimited</span>
        </h1>

        <p>
          A universal card collection archive built for collectors who care about
          completion, variants, values, wishlists, decks, and long-term collection history.
        </p>

        <div className="tu-vault-stats" aria-label="Tracker Unlimited platform features">
          <div>
            <span>01</span>
            <strong>Collection</strong>
          </div>
          <div>
            <span>02</span>
            <strong>Completion</strong>
          </div>
          <div>
            <span>03</span>
            <strong>Variants</strong>
          </div>
          <div>
            <span>04</span>
            <strong>Analytics</strong>
          </div>
        </div>
      </section>

      <section className="tu-vault-selector" aria-label="Choose archive">
        <div className="tu-vault-selector-header">
          <div>
            <div className="tu-vault-kicker">Choose Your Archive</div>
            <h2>Available Collections</h2>
          </div>
          <p>
            Each archive keeps its own theme, data structure, and collecting tools while
            sharing the Tracker Unlimited platform.
          </p>
        </div>

        <div className="tu-vault-grid">
          {archives.map((archive) => (
            <ArchiveTile key={archive.href} archive={archive} />
          ))}
        </div>
      </section>

      <section className="tu-vault-roadmap">
        <div className="tu-vault-kicker">Future Archives</div>
        <p>Designed to expand later into Magic, Lorcana, One Piece, Yu-Gi-Oh, and more.</p>
      </section>
    </main>
  );
}
