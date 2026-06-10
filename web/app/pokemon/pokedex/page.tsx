import Link from "next/link";
import { getPokemonPokedexRows, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonPokedexPage() {
  const { supabase } = await getPokemonUser();
  const rows = await getPokemonPokedexRows(supabase);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">POKÉDEX</div>
          <div className="pkdx-number">{rows.length || "000"}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">National Archive</div>
              <h1>Pokédex</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">
            Each Pokémon shows a cycling-style preview of card art. Open a Pokémon to see every card currently imported for that species.
          </p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {rows.map((row: any) => (
            <Link key={row.slug} href={`/pokemon/pokedex/${row.slug}`} className="pkdx-pokemon-card">
              <div className="pkdx-pokemon-image">
                {row.images?.[0] ? <img src={row.images[0]} alt={row.name} /> : "?"}
              </div>
              <div>
                <div className="pkdx-resource-number">#{String(row.dex || "?").padStart(3, "0")}</div>
                <h3>{row.name}</h3>
                <p>{row.cardCount} cards imported</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
