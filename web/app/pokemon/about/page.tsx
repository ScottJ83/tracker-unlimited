export const dynamic = "force-dynamic";

export default function PokemonAboutPage() {
  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">ABOUT</div>
          <div className="pkdx-number">TU</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Pokémon Tracker Unlimited</div>
              <h1>About</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">
            The Pokémon archive is being built as a Level 4 collector system: every Pokémon, every card, every print, every variant, every language, every stamp, and every collectible version possible.
          </p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Goal</div>
            <h2>Archive Everything</h2>
          </div>
        </div>
        <p className="pkdx-panel-text">
          This Alpha adds the database framework, TCGDex importer, Pokédex browsing, sets,
          regions, collection tabs, wishlist, analytics, and deck scaffolding. The next
          refinements will focus on variant accuracy, languages, set completion, and import scale.
        </p>
      </section>
    </main>
  );
}
