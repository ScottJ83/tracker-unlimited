import Link from "next/link";
import { getPokemonRegionsWithCompletion, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonRegionsPage() {
  const { supabase, user } = await getPokemonUser();
  const regions = await getPokemonRegionsWithCompletion(supabase, user?.id);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">REGIONS</div>
          <div className="pkdx-number">{regions.length}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Regional Archive</div>
              <h1>Regions</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Browse Pokémon by region with region-level ownership completion.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {regions.map((region: any) => (
            <Link key={region.slug} href={`/pokemon/regions/${region.slug}`} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{region.start}</div>
              <div>
                <h3>{region.name}</h3>
                <p>{region.ownedPokemon} / {region.end - region.start + 1} Pokémon owned • {region.completion.toFixed(1)}%</p>
                <div className="pkdx-mini-progress"><span style={{ width: `${region.completion}%` }} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
