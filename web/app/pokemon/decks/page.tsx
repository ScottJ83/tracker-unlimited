import Link from "next/link";

export const dynamic = "force-dynamic";

const resources = [
  ["Pokédex", "/pokemon/pokedex", "001"],
  ["Sets", "/pokemon/sets", "151"],
  ["Regions", "/pokemon/regions", "025"],
  ["Collection", "/pokemon/collection", "493"],
  ["Decks", "/pokemon/decks", "006"],
  ["Analytics", "/pokemon/analytics", "881"],
  ["About", "/pokemon/about", "TU"],
];

export default function Page() {
  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens">
            <span />
          </div>

          <div className="pkdx-title-pill">POKÉMON</div>

          <div className="pkdx-number">006</div>
        </div>

        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Pokémon TU</div>
              <h1>Pokémon Decks</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>

          <p className="pkdx-intro">Build and manage Pokémon decks once the Pokémon data layer is connected.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Framework Status</div>
            <h2>Coming Online</h2>
          </div>
          <div className="pkdx-mini-dpad">
            <span />
          </div>
        </div>

        <p className="pkdx-panel-text">
          This page is part of the Pokémon Tracker Unlimited framework. TCGDex
          integration, Pokémon card data, variants, languages, pricing, collection
          entries, and completion tracking will be connected in a later phase.
        </p>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Archive Resources</div>
            <h2>Navigation</h2>
          </div>
        </div>

        <div className="pkdx-resource-grid">
          {resources.map(([label, href, number]) => (
            <Link key={href} href={href} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{number}</div>
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
