import Link from "next/link";

export const dynamic = "force-dynamic";

const resources = [
  ["Pokédex", "/pokemon/pokedex", "National, regional, forms, and future card archive views.", "001"],
  ["Sets", "/pokemon/sets", "Expansion browsing, completion, variants, and values.", "151"],
  ["Regions", "/pokemon/regions", "Kanto through Paldea completion archives.", "025"],
  ["Collection", "/pokemon/collection", "Owned, uncollected, and wishlist collection hub.", "493"],
  ["Decks", "/pokemon/decks", "Future Pokémon deck building tools.", "006"],
  ["Analytics", "/pokemon/analytics", "Collection value, completion, rarity, and region insights.", "881"],
  ["About", "/pokemon/about", "Pokémon Tracker Unlimited project archive.", "TU"],
];

export default function PokemonHomePage() {
  return (
    <main className="pkdx-page">
      <section className="pkdx-device">
        <div className="pkdx-topbar">
          <div className="pkdx-lens">
            <span />
          </div>

          <div className="pkdx-title-pill">POKÉMON</div>

          <div className="pkdx-number">881</div>
        </div>

        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Tracker Unlimited</div>
              <h1>Pokémon Archive</h1>
            </div>

            <div className="pkdx-status-light" />
          </div>

          <p className="pkdx-intro">
            A Pokédex-inspired framework for Level 4 collecting: cards, sets,
            variants, languages, regions, prices, wishlists, decks, and future
            master completion tracking.
          </p>

          <div className="pkdx-actions">
            <Link href="/pokemon/pokedex" className="pkdx-button">
              Open Pokédex
            </Link>
            <Link href="/pokemon/collection" className="pkdx-button pkdx-button-white">
              Collection
            </Link>
          </div>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Archive Resources</div>
            <h2>Tracker Tools</h2>
          </div>
          <div className="pkdx-mini-dpad">
            <span />
          </div>
        </div>

        <div className="pkdx-resource-grid">
          {resources.map(([label, href, text, number]) => (
            <Link key={href} href={href} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{number}</div>
              <div>
                <h3>{label}</h3>
                <p>{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
