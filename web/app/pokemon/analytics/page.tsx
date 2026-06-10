import { redirect } from "next/navigation";
import PokemonProgress from "@/components/pokemon/PokemonProgress";
import { getPokemonCounts, getPokemonRegionsWithCompletion, getPokemonSetsWithCompletion, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonAnalyticsPage() {
  const { supabase, user } = await getPokemonUser();
  if (!user) redirect("/login");

  const [counts, regions, sets] = await Promise.all([
    getPokemonCounts(supabase, user.id),
    getPokemonRegionsWithCompletion(supabase, user.id),
    getPokemonSetsWithCompletion(supabase, user.id),
  ]);

  const topSets = [...sets].sort((a: any, b: any) => b.completion - a.completion).slice(0, 8);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">ANALYTICS</div>
          <div className="pkdx-number">{counts.printCompletion.toFixed(1)}%</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Collection Insights</div>
              <h1>Analytics</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Pokémon-specific collection, card, print, variant, set, and region analytics.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-progress-grid">
          <PokemonProgress label="Pokémon Completion" value={counts.ownedPokemon} total={counts.nationalPokemonTotal} percent={counts.pokemonCompletion} />
          <PokemonProgress label="Card Completion" value={counts.ownedCards} total={counts.cards} percent={counts.cardCompletion} />
          <PokemonProgress label="Print Completion" value={counts.ownedPrints} total={counts.prints} percent={counts.printCompletion} />
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-stat-grid">
          <div><span>Collection Value</span><strong>${counts.collectionValue.toFixed(2)}</strong></div>
          <div><span>Wishlist Value</span><strong>${counts.wishlistValue.toFixed(2)}</strong></div>
          <div><span>Wishlist Prints</span><strong>{counts.wishedPrints.toLocaleString()}</strong></div>
          <div><span>Imported Sets</span><strong>{counts.sets.toLocaleString()}</strong></div>
          <div><span>Imported Cards</span><strong>{counts.cards.toLocaleString()}</strong></div>
          <div><span>Imported Prints</span><strong>{counts.prints.toLocaleString()}</strong></div>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header"><div><div className="pkdx-kicker">Regions</div><h2>Completion by Region</h2></div></div>
        <div className="pkdx-resource-grid">
          {regions.map((region: any) => (
            <div key={region.slug} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{region.start}</div>
              <div>
                <h3>{region.name}</h3>
                <p>{region.ownedPokemon} owned • {region.completion.toFixed(1)}%</p>
                <div className="pkdx-mini-progress"><span style={{ width: `${region.completion}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-panel-header"><div><div className="pkdx-kicker">Sets</div><h2>Top Set Completion</h2></div></div>
        <div className="pkdx-resource-grid">
          {topSets.map((set: any) => (
            <div key={set.id} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{set.symbol ? <img src={set.symbol} alt="" /> : "SET"}</div>
              <div>
                <h3>{set.name}</h3>
                <p>{set.ownedPrints} / {set.printTotal} prints • {set.completion.toFixed(1)}%</p>
                <div className="pkdx-mini-progress"><span style={{ width: `${set.completion}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
