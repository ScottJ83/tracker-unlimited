import "../mtg.css";
import { getMtgCounts, getMtgUser } from "@/lib/mtg/queries";

export default async function Page() {
  const { supabase, user } = await getMtgUser();
  const counts = await getMtgCounts(supabase, user?.id);
  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero">
          <p className="mtg-kicker">Magic: The Gathering</p>
          <h1>Decks</h1>
          <p>This MTG section is ready for the bulk Scryfall archive import. Current archive: {counts.sets} sets, {counts.cards} cards, {counts.printings} printings.</p>
        </section>
      </div>
    </main>
  );
}
