import Link from "next/link";
import { getPokemonCounts, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonHomePage() {
  const { supabase, user } = await getPokemonUser();
  const counts = await getPokemonCounts(supabase, user?.id);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">POKÉMON</div>
          <div className="pkdx-number">{counts.cards || "000"}</div>
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
            A Pokédex-inspired archive for Level 4 collecting: Pokémon, sets,
            cards, prints, variants, wishlists, collection tracking, and analytics.
          </p>

          <div className="pkdx-actions">
            <Link href="/pokemon/pokedex" className="pkdx-button">Open Pokédex</Link>
            <Link href="/pokemon/collection" className="pkdx-button pkdx-button-white">Collection</Link>
          </div>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Archive Status</div>
            <h2>Database</h2>
          </div>
          <div className="pkdx-mini-dpad"><span /></div>
        </div>

        <div className="pkdx-stat-grid">
          <div><span>Sets</span><strong>{counts.sets}</strong></div>
          <div><span>Cards</span><strong>{counts.cards}</strong></div>
          <div><span>Prints / Variants</span><strong>{counts.prints}</strong></div>
          <div><span>Owned Prints</span><strong>{counts.ownedPrints}</strong></div>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Import</div>
            <h2>TCGDex Alpha</h2>
          </div>
        </div>

        <p className="pkdx-panel-text">
          After running the Pokémon SQL schema, use the import endpoint to pull an initial
          TCGDex sample into Supabase. Import route: <code>/api/pokemon/import</code>.
        </p>
      </section>
    </main>
  );
}
