import Link from "next/link";

export const dynamic = "force-dynamic";

const resources = [
  ["Pokédex", "/pokemon/pokedex"],
  ["Sets", "/pokemon/sets"],
  ["Regions", "/pokemon/regions"],
  ["Collection", "/pokemon/collection"],
  ["Decks", "/pokemon/decks"],
  ["Analytics", "/pokemon/analytics"],
  ["About", "/pokemon/about"],
];

export default function Page() {
  return (
    <main>
      <section className="pkm-hero pkm-hero-small">
        <div className="pkm-device-light" />
        <div className="pkm-kicker">Pokémon TU</div>
        <h1>Pokémon Collection</h1>
        <p>Manage owned cards, uncollected cards, and wishlist entries from one Pokémon collection hub.</p>
      </section>

      <section className="pkm-panel">
        <div className="pkm-panel-header">
          <div>
            <div className="pkm-kicker">Framework Status</div>
            <h2>Coming Online</h2>
          </div>
          <div className="pkm-dex-number">493</div>
        </div>

        <p className="pkm-panel-text">
          This page is part of the Pokémon Tracker Unlimited framework. TCGDex integration,
          Pokémon card data, variants, languages, pricing, collection entries, and completion
          tracking will be connected in a later phase.
        </p>
      </section>

      <section className="pkm-panel">
        <div className="pkm-panel-header">
          <div>
            <div className="pkm-kicker">Archive Resources</div>
            <h2>Navigation</h2>
          </div>
        </div>

        <div className="pkm-resource-grid">
          {resources.map(([label, href]) => (
            <Link key={href} href={href} className="pkm-resource-card">
              <div className="pkm-resource-icon">{label.slice(0, 1)}</div>
              <div>
                <h3>{label}</h3>
                <p>Open the {label} section.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
