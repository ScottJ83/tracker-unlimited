import Link from "next/link";
import { getPokemonUser } from "@/lib/pokemon/queries";
import { pokemonRegions } from "@/lib/pokemon/tcgdex";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function PokemonRegionPage({ params }: Props) {
  const { region: slug } = await params;
  const region = pokemonRegions.find((item) => item.slug === slug);
  const { supabase } = await getPokemonUser();

  if (!region) {
    return <main className="pkdx-page"><section className="pkdx-panel">Region not found.</section></main>;
  }

  const { data } = await supabase
    .from("pokemon_cards")
    .select("name, slug, dex_ids, image, id")
    .not("dex_ids", "eq", "{}");

  const grouped = new Map<string, any>();
  for (const card of data || []) {
    const dex = Array.isArray(card.dex_ids) ? card.dex_ids[0] : null;
    if (!dex || dex < region.start || dex > region.end) continue;
    const key = card.slug || card.name;
    if (!grouped.has(key)) {
      grouped.set(key, { name: card.name, slug: card.slug, dex, image: card.image, cardCount: 0 });
    }
    grouped.get(key).cardCount += 1;
  }

  const rows = Array.from(grouped.values()).sort((a, b) => a.dex - b.dex);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{region.name}</div>
          <div className="pkdx-number">{rows.length}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Regional Archive</div>
              <h1>{region.name}</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Pokémon imported for {region.name}. Open a Pokémon to see all imported cards.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-resource-grid">
          {rows.map((row: any) => (
            <Link key={row.slug} href={`/pokemon/pokedex/${row.slug}`} className="pkdx-pokemon-card">
              <div className="pkdx-pokemon-image">
                {row.image ? <img src={row.image} alt={row.name} /> : "?"}
              </div>
              <div>
                <div className="pkdx-resource-number">#{String(row.dex).padStart(3, "0")}</div>
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
