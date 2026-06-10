import Link from "next/link";
import PokemonProgress from "@/components/pokemon/PokemonProgress";
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
          <div className="pkdx-number">{counts.importedPokemon || "000"}</div>
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
            A Pokédex-inspired archive for Level 4 collecting: Pokémon, sets, cards, prints, variants, wishlists, collection tracking, and analytics.
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
            <div className="pkdx-kicker">Master Archive Progress</div>
            <h2>Completion</h2>
          </div>
          <div className="pkdx-mini-dpad"><span /></div>
        </div>

        <div className="pkdx-progress-grid">
          <PokemonProgress label="Pokémon Owned" value={counts.ownedPokemon} total={counts.nationalPokemonTotal} percent={counts.pokemonCompletion} />
          <PokemonProgress label="Cards Owned" value={counts.ownedCards} total={counts.cards} percent={counts.cardCompletion} />
          <PokemonProgress label="Prints / Variants Owned" value={counts.ownedPrints} total={counts.prints} percent={counts.printCompletion} />
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header">
          <div>
            <div className="pkdx-kicker">Database</div>
            <h2>Imported Data</h2>
          </div>
        </div>

        <div className="pkdx-stat-grid">
          <div><span>Sets</span><strong>{counts.sets.toLocaleString()}</strong></div>
          <div><span>Cards</span><strong>{counts.cards.toLocaleString()}</strong></div>
          <div><span>Prints / Variants</span><strong>{counts.prints.toLocaleString()}</strong></div>
          <div><span>Imported Pokémon</span><strong>{counts.importedPokemon.toLocaleString()}</strong></div>
          <div><span>Collection Value</span><strong>${counts.collectionValue.toFixed(2)}</strong></div>
          <div><span>Wishlist Value</span><strong>${counts.wishlistValue.toFixed(2)}</strong></div>
        </div>
      </section>
    </main>
  );
}
