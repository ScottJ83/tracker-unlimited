import "../mtg.css";
import { getMtgRecentCards, getMtgUser } from "@/lib/mtg/queries";
import MtgCardTile from "@/components/mtg/MtgCardTile";

export default async function MtgCardsPage() {
  const { supabase } = await getMtgUser();
  const cards = await getMtgRecentCards(supabase, 60);
  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero"><p className="mtg-kicker">Spell Archive</p><h1>Cards</h1><p>Gallery view for imported cards and printings.</p></section>
        <section className="mtg-panel"><div className="mtg-card-grid">{cards.map((card: any) => <MtgCardTile key={card.id} card={card} />)}</div></section>
      </div>
    </main>
  );
}
