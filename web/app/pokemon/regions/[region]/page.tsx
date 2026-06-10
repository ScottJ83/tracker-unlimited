import Link from "next/link";
import { getPokemonPokedexRows, getPokemonUser } from "@/lib/pokemon/queries";
import { pokemonRegions } from "@/lib/pokemon/tcgdex";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ region: string }> };

export default async function PokemonRegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = pokemonRegions.find((item) => item.slug === slug);
  const { supabase, user } = await getPokemonUser();

  if (!region) return <main className="pkdx-page"><section className="pkdx-panel">Region not found.</section></main>;

  const allRows = await getPokemonPokedexRows(supabase, user?.id);
  const rows = allRows.filter((row: any) => row.dex && row.dex >= region.start && row.dex <= region.end);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{region.name}</div>
          <div className="pkdx-number">{rows.filter((row: any) => row.ownedCardCount > 0).length}/{region.end - region.start + 1}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Regional Archive</div>
              <h1>{region.name}</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">One tile per Pokémon in {region.name}, grouped by National Dex number.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {rows.map((row: any) => (
            <Link key={row.slug} href={`/pokemon/pokedex/${row.slug}`} className={row.ownedCardCount > 0 ? "pkdx-pokemon-card pkdx-owned" : "pkdx-pokemon-card"}>
              <div className="pkdx-pokemon-image">
                {row.images?.[0] ? <img src={row.images[0]} alt={row.name} /> : "?"}
              </div>
              <div>
                <div className="pkdx-resource-number">#{String(row.dex).padStart(3, "0")}</div>
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
