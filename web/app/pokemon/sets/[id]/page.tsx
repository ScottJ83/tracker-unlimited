import Link from "next/link";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PokemonSetPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await getPokemonUser();

  const { data: set } = await supabase.from("pokemon_sets").select("*").eq("id", id).maybeSingle();
  const { data: cards } = await supabase
    .from("pokemon_cards")
    .select("*")
    .eq("set_id", id)
    .order("local_id", { ascending: true });

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{set?.name || "Set"}</div>
          <div className="pkdx-number">{cards?.length || 0}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Set Archive</div>
              <h1>{set?.name || "Set"}</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Cards imported for this set. Open a card to see all available prints and variants.</p>
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
                <p>#{card.local_id || "-"} • {card.rarity || "Unknown rarity"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
