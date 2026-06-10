import PokemonPrintCard from "@/components/pokemon/PokemonPrintCard";
import { getPokemonCollectionEntries, getPokemonUser, getPokemonWishlistEntries } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PokemonCardPage({ params }: Props) {
  const { id } = await params;
  const { supabase, user } = await getPokemonUser();

  const [{ data: card }, { data: prints }, owned, wishlist] = await Promise.all([
    supabase.from("pokemon_cards").select("*, pokemon_sets(*)").eq("id", id).maybeSingle(),
    supabase
      .from("pokemon_prints")
      .select("*, pokemon_cards(*), pokemon_sets(*)")
      .eq("card_id", id)
      .order("print_name", { ascending: true }),
    getPokemonCollectionEntries(supabase, user?.id),
    getPokemonWishlistEntries(supabase, user?.id),
  ]);

  const ownedByPrint = new Map((owned || []).map((entry: any) => [entry.print_id, entry]));
  const wished = new Set((wishlist || []).map((entry: any) => entry.print_id));

  if (!card) {
    return <main className="pkdx-page"><section className="pkdx-panel">Card not found.</section></main>;
  }

  const ownedPrintCount = (prints || []).filter((print: any) => Number(ownedByPrint.get(print.id)?.quantity || 0) > 0).length;

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{card.name}</div>
          <div className="pkdx-number">{ownedPrintCount}/{prints?.length || 0}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Card Prints</div>
              <h1>{card.name}</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">
            {card.pokemon_sets?.name || "Unknown Set"} #{card.local_id || "-"} • {card.rarity || "Unknown rarity"}
          </p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-card-grid">
          {(prints || []).map((print: any) => (
            <PokemonPrintCard
              key={print.id}
              print={print}
              quantity={Number(ownedByPrint.get(print.id)?.quantity || 0)}
              wished={wished.has(print.id)}
              linkCard={false}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
