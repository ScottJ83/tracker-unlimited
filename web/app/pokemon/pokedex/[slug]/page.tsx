import Link from "next/link";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PokemonSpeciesPage({ params }: Props) {
  const { slug } = await params;
  const { supabase } = await getPokemonUser();

  const { data: cards } = await supabase
    .from("pokemon_cards")
    .select("*, pokemon_sets(name)")
    .eq("slug", slug)
    .order("set_id", { ascending: false });

  const name = cards?.[0]?.name || slug;

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{name}</div>
          <div className="pkdx-number">{cards?.length || 0}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Species Archive</div>
              <h1>{name}</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Every imported {name} card. Open a card to view every print or variant.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-card-grid">
          {(cards || []).map((card: any) => (
            <Link key={card.id} href={`/pokemon/cards/${card.id}`} className="pkdx-card-tile">
              <div className="pkdx-card-image">
                {card.image ? <img src={card.image} alt={card.name} /> : "?"}
              </div>
              <div className="pkdx-card-info">
                <h3>{card.name}</h3>
                <p>{card.pokemon_sets?.name || "Unknown Set"} #{card.local_id || "-"}</p>
                <p>{card.rarity || "Unknown rarity"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
