import Link from "next/link";
import { getPokemonRegions, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonRegionsPage() {
  const { supabase } = await getPokemonUser();
  const regions = await getPokemonRegions(supabase);

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
          <p className="pkdx-intro">Browse Pokémon by region, then open a Pokémon to see every imported card and variant.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {regions.map((region: any) => (
            <Link key={region.slug} href={`/pokemon/regions/${region.slug}`} className="pkdx-resource-card">
              <div className="pkdx-resource-number">{region.start}</div>
              <div>
                <h3>{region.name}</h3>
                <p>{region.pokemonCount} Pokémon • {region.cardCount} cards imported</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
