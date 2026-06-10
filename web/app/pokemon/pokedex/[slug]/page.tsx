import Link from "next/link";
import { getPokemonCollectionEntries, getPokemonUser } from "@/lib/pokemon/queries";
import { percent } from "@/lib/pokemon/tcgdex";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function PokemonSpeciesPage({ params }: Props) {
  const { slug } = await params;
  const { supabase, user } = await getPokemonUser();

  const [{ data: cards }, ownedEntries] = await Promise.all([
    supabase
      .from("pokemon_cards")
      .select("*, pokemon_sets(name)")
      .eq("slug", slug)
      .order("set_id", { ascending: false }),
    getPokemonCollectionEntries(supabase, user?.id),
  ]);

  const name = cards?.[0]?.name || slug;
  const ownedPrintIds = new Set((ownedEntries || []).map((entry: any) => entry.print_id));
  const ownedCards = new Set<string>();

  if (ownedPrintIds.size) {
    const { data: prints } = await supabase
      .from("pokemon_prints")
      .select("id, card_id")
      .in("id", Array.from(ownedPrintIds));

    for (const print of prints || []) {
      if ((cards || []).some((card: any) => card.id === print.card_id)) ownedCards.add(print.card_id);
    }
  }

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{name}</div>
          <div className="pkdx-number">{ownedCards.size}/{cards?.length || 0}</div>
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
        <div className="pkdx-stat-grid">
          <div><span>Cards Owned</span><strong>{ownedCards.size}</strong></div>
          <div><span>Cards Imported</span><strong>{cards?.length || 0}</strong></div>
          <div><span>Completion</span><strong>{percent(ownedCards.size, cards?.length || 0).toFixed(1)}%</strong></div>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-card-grid">
          {(cards || []).map((card: any) => (
            <Link key={card.id} href={`/pokemon/cards/${card.id}`} className={ownedCards.has(card.id) ? "pkdx-card-tile pkdx-owned" : "pkdx-card-tile"}>
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
