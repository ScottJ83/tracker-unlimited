import Link from "next/link";

export const dynamic = "force-dynamic";

const resources = [
  ["Pokédex", "/pokemon/pokedex", "National, regional, forms, and future card archive views."],
  ["Sets", "/pokemon/sets", "Expansion browsing, completion, variants, and values."],
  ["Regions", "/pokemon/regions", "Kanto through Paldea completion archives."],
  ["Collection", "/pokemon/collection", "Owned, uncollected, and wishlist collection hub."],
  ["Decks", "/pokemon/decks", "Future Pokémon deck building tools."],
  ["Analytics", "/pokemon/analytics", "Collection value, completion, rarity, and region insights."],
  ["About", "/pokemon/about", "Pokémon Tracker Unlimited project archive."],
];

const regions = [
  ["Kanto", "151 / 151", "Bulbasaur • Charmander • Squirtle"],
  ["Johto", "100 / 100", "Chikorita • Cyndaquil • Totodile"],
  ["Hoenn", "135 / 135", "Treecko • Torchic • Mudkip"],
  ["Sinnoh", "104 / 107", "Turtwig • Chimchar • Piplup"],
  ["Unova", "155 / 156", "Snivy • Tepig • Oshawott"],
  ["Kalos", "67 / 72", "Chespin • Fennekin • Froakie"],
  ["Alola", "0 / 88", "Rowlet • Litten • Popplio"],
  ["Galar", "0 / 96", "Grookey • Scorbunny • Sobble"],
  ["Paldea", "0 / 120+", "Sprigatito • Fuecoco • Quaxly"],
];

export default function PokemonHomePage() {
  return (
    <main>
      <section className="pkm-hero">
        <div className="pkm-device-light" />
        <div className="pkm-kicker">Pokémon TU</div>
        <h1>Pokémon Archive</h1>
        <p>
          A Pokédex-inspired framework for Level 4 collecting: cards, sets, variants,
          languages, regions, prices, wishlists, decks, and future master completion tracking.
        </p>

        <div className="pkm-hero-actions">
          <Link href="/pokemon/pokedex" className="pkm-button">Open Pokédex</Link>
          <Link href="/pokemon/regions" className="pkm-button pkm-button-secondary">View Regions</Link>
        </div>
      </section>

      <section className="pkm-panel">
        <div className="pkm-panel-header">
          <div>
            <div className="pkm-kicker">Archive Resources</div>
            <h2>Tracker Tools</h2>
          </div>
          <div className="pkm-dex-number">001</div>
        </div>

        <div className="pkm-resource-grid">
          {resources.map(([label, href, text]) => (
            <Link key={href} href={href} className="pkm-resource-card">
              <div className="pkm-resource-icon">{label.slice(0, 1)}</div>
              <div>
                <h3>{label}</h3>
                <p>{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pkm-panel">
        <div className="pkm-panel-header">
          <div>
            <div className="pkm-kicker">Regional Archive Preview</div>
            <h2>Regions</h2>
          </div>
          <Link href="/pokemon/regions" className="pkm-mini-link">See All</Link>
        </div>

        <div className="pkm-region-list">
          {regions.slice(0, 6).map(([name, progress, starters]) => (
            <Link key={name} href="/pokemon/regions" className="pkm-region-card">
              <div>
                <h3>{name}</h3>
                <div className="pkm-complete">Complete!</div>
                <strong>{progress}</strong>
              </div>
              <div className="pkm-region-sprite-strip">{starters}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
