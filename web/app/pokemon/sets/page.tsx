import Link from "next/link";
import { getPokemonSets, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonSetsPage() {
  const { supabase } = await getPokemonUser();
  const sets = await getPokemonSets(supabase);

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
          <p className="pkdx-intro">Every imported set. Open a set to see cards, then open a card to see its variants and prints.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {sets.map((set: any) => (
            <Link key={set.id} href={`/pokemon/sets/${set.id}`} className="pkdx-resource-card">
              <div className="pkdx-resource-number">
                {set.symbol ? <img src={set.symbol} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : "SET"}
              </div>
              <div>
                <h3>{set.name}</h3>
                <p>{set.card_count_total || 0} cards • {set.release_date || "Unknown date"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
