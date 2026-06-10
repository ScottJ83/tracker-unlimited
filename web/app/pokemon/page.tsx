import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PokemonPokemonPage() {
  const cards = [
    ["Pokédex", "/pokemon/pokedex"],
    ["Sets", "/pokemon/sets"],
    ["Regions", "/pokemon/regions"],
    ["Collection", "/pokemon/collection"],
    ["Decks", "/pokemon/decks"],
    ["Analytics", "/pokemon/analytics"],
    ["About", "/pokemon/about"],
  ];

  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Pokémon TU</div>
        <h1 className="sw-page-title">Pokémon Archive</h1>
        <div className="sw-page-subtitle">A new Tracker Unlimited archive for Pokédex browsing, set completion, collection tracking, wishlists, decks, and analytics.</div>
      </div>

      <section className="sw-panel" style={{ padding: "24px", marginBottom: "22px" }}>
        <div className="sw-kicker" style={{ marginBottom: "12px" }}>
          Framework Status
        </div>
        <p style={{ color: "#d5d5d5", lineHeight: 1.75, margin: 0, maxWidth: "900px" }}>
          This page is part of the Pokémon framework for Tracker Unlimited. TCGDex integration,
          Pokémon cards, variants, languages, prices, and collection data will be connected in a later phase.
        </p>
      </section>

      <div className="sw-grid">
        {cards.map(([label, href]) => (
          <Link key={href} href={href} className="sw-card" style={{ padding: "20px" }}>
            <div className="sw-kicker" style={{ marginBottom: "10px" }}>Archive Resource</div>
            <h2 style={{ margin: 0, color: "#fff" }}>{label}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
