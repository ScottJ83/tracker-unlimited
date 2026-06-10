import { redirect } from "next/navigation";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonDecksPage() {
  const { supabase, user } = await getPokemonUser();
  if (!user) redirect("/login");

  const { data: decks } = await supabase
    .from("pokemon_decks")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">DECKS</div>
          <div className="pkdx-number">{decks?.length || 0}</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Deck Builder Alpha</div>
              <h1>Decks</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">
            Pokémon decks are scaffolded. Full deck rules, formats, Pokémon/Trainer/Energy summaries, and validation will be added after the card database stabilizes.
          </p>
        </div>
      </section>

      <section className="pkdx-panel">
        <p className="pkdx-panel-text">
          Deck records are ready in the database. The full Pokémon deck builder will come after the importer and variant model are tested.
        </p>
      </section>
    </main>
  );
}
