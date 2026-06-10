import Link from "next/link";
import { getPokemonSetsWithCompletion, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonSetsPage() {
  const { supabase, user } = await getPokemonUser();
  const sets = await getPokemonSetsWithCompletion(supabase, user?.id);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">SETS</div>
          <div className="pkdx-number">{sets.length}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Set Archive</div>
              <h1>Pokémon Sets</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Every imported set with print-level completion tracking.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {sets.map((set: any) => (
            <Link key={set.id} href={`/pokemon/sets/${set.id}`} className="pkdx-resource-card pkdx-set-card">
              <div className="pkdx-resource-number">
                {set.symbol ? <img src={set.symbol} alt="" /> : "SET"}
              </div>
              <div>
                <h3>{set.name}</h3>
                <p>{set.ownedPrints} / {set.printTotal} prints owned • {set.completion.toFixed(1)}%</p>
                <div className="pkdx-mini-progress"><span style={{ width: `${set.completion}%` }} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
