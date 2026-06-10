import { redirect } from "next/navigation";
import PokemonCollectionClient from "@/components/pokemon/PokemonCollectionClient";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonCollectionPage() {
  const { supabase, user } = await getPokemonUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: prints }, { data: owned }, { data: wishlist }] = await Promise.all([
    supabase
      .from("pokemon_prints")
      .select("*, pokemon_cards(*), pokemon_sets(*)")
      .order("print_name", { ascending: true })
      .limit(1500),
    supabase
      .from("pokemon_collection_entries")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("pokemon_wishlist_entries")
      .select("*")
      .eq("user_id", user.id),
  ]);

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">COLLECTION</div>
          <div className="pkdx-number">{owned?.length || 0}</div>
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

      <PokemonCollectionClient prints={prints || []} owned={owned || []} wishlist={wishlist || []} />
    </main>
  );
}
