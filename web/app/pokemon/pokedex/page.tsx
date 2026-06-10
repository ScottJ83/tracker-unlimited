import Link from "next/link";
import PokemonProgress from "@/components/pokemon/PokemonProgress";
import { getPokemonCounts, getPokemonPokedexRows, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonPokedexPage() {
  const { supabase, user } = await getPokemonUser();
  const [rows, counts] = await Promise.all([
    getPokemonPokedexRows(supabase, user?.id),
    getPokemonCounts(supabase, user?.id),
  ]);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">POKÉDEX</div>
          <div className="pkdx-number">{counts.ownedPokemon}/{counts.nationalPokemonTotal}</div>
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
            Each Pokémon shows imported card art. A Pokémon counts as owned when you own at least one print of one card for that Pokémon.
          </p>
        </div>
      </section>

      <section className="pkdx-panel">
        <PokemonProgress label="Pokémon Completion" value={counts.ownedPokemon} total={counts.nationalPokemonTotal} percent={counts.pokemonCompletion} />
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {rows.map((row: any) => (
            <Link key={row.slug} href={`/pokemon/pokedex/${row.slug}`} className={row.ownedCardCount > 0 ? "pkdx-pokemon-card pkdx-owned" : "pkdx-pokemon-card"}>
              <div className="pkdx-pokemon-image">
                {row.images?.[0] ? <img src={row.images[0]} alt={row.name} /> : "?"}
              </div>
              <div>
                <div className="pkdx-resource-number">#{String(row.dex || "?").padStart(3, "0")}</div>
                <h3>{row.name}</h3>
                <p>{row.ownedCardCount} / {row.cardCount} cards owned</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
