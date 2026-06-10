import PokemonQuantityButton from "@/components/pokemon/PokemonQuantityButton";
import PokemonWishlistButton from "@/components/pokemon/PokemonWishlistButton";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PokemonCardPage({ params }: Props) {
  const { id } = await params;
  const { supabase, user } = await getPokemonUser();

  const { data: card } = await supabase
    .from("pokemon_cards")
    .select("*, pokemon_sets(*)")
    .eq("id", id)
    .maybeSingle();

  const { data: prints } = await supabase
    .from("pokemon_prints")
    .select("*")
    .eq("card_id", id)
    .order("print_name", { ascending: true });

  const { data: owned } = user
    ? await supabase
        .from("pokemon_collection_entries")
        .select("*")
        .eq("user_id", user.id)
    : { data: [] as any[] };

  const { data: wishlist } = user
    ? await supabase
        .from("pokemon_wishlist_entries")
        .select("*")
        .eq("user_id", user.id)
    : { data: [] as any[] };

  const ownedByPrint = new Map((owned || []).map((entry: any) => [entry.print_id, entry]));
  const wished = new Set((wishlist || []).map((entry: any) => entry.print_id));

  if (!card) {
    return (
      <main className="pkdx-page">
        <section className="pkdx-panel">Card not found.</section>
      </main>
    );
  }

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">{card.name}</div>
          <div className="pkdx-number">{prints?.length || 0}</div>
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
          {(prints || []).map((print: any) => {
            const quantity = Number(ownedByPrint.get(print.id)?.quantity || 0);
            return (
              <article key={print.id} className="pkdx-card-tile">
                <div className="pkdx-card-image">
                  {print.image || card.image ? <img src={print.image || card.image} alt={card.name} /> : "?"}
                </div>
                <div className="pkdx-card-info">
                  <h3>{print.print_name}</h3>
                  <p>Language: {print.language}</p>
                  <p>Market: ${Number(print.price_market || 0).toFixed(2)}</p>
                </div>
                <div className="pkdx-card-actions">
                  <PokemonQuantityButton printId={print.id} quantity={quantity} />
                  <PokemonWishlistButton printId={print.id} wished={wished.has(print.id)} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
