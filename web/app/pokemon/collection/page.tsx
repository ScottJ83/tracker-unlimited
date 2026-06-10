import { redirect } from "next/navigation";
import PokemonCollectionClient from "@/components/pokemon/PokemonCollectionClient";
import PokemonProgress from "@/components/pokemon/PokemonProgress";
import { getPokemonCollectionEntries, getPokemonCounts, getPokemonUser, getPokemonWishlistEntries } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonCollectionPage() {
  const { supabase, user } = await getPokemonUser();

  if (!user) redirect("/login");

  const [counts, owned, wishlist, { data: prints }] = await Promise.all([
    getPokemonCounts(supabase, user.id),
    getPokemonCollectionEntries(supabase, user.id),
    getPokemonWishlistEntries(supabase, user.id),
    supabase
      .from("pokemon_prints")
      .select("*, pokemon_cards(*), pokemon_sets(*)")
      .order("updated_at", { ascending: false })
      .limit(2500),
  ]);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">COLLECTION</div>
          <div className="pkdx-number">{counts.ownedPrints}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Owned / Uncollected / Wishlist</div>
              <h1>Collection</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Track every Pokémon print and variant. Uncollected and Wishlist live inside this Collection hub.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-progress-grid">
          <PokemonProgress label="Cards Owned" value={counts.ownedCards} total={counts.cards} percent={counts.cardCompletion} />
          <PokemonProgress label="Prints Owned" value={counts.ownedPrints} total={counts.prints} percent={counts.printCompletion} />
          <PokemonProgress label="Pokémon Owned" value={counts.ownedPokemon} total={counts.nationalPokemonTotal} percent={counts.pokemonCompletion} />
        </div>
      </section>

      <PokemonCollectionClient prints={prints || []} owned={owned || []} wishlist={wishlist || []} />
    </main>
  );
}
