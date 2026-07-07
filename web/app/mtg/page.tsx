import Link from "next/link";
import "./mtg.css";
import { getMtgCounts, getMtgRecentCards, getMtgUser } from "@/lib/mtg/queries";
import MtgCardTile from "@/components/mtg/MtgCardTile";

export default async function MtgPage() {
  const { supabase, user } = await getMtgUser();
  const counts = await getMtgCounts(supabase, user?.id);
const recent = await getMtgRecentCards(supabase, user?.id, 8);

  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero">
          <p className="mtg-kicker">Tracker Unlimited</p>
          <h1>Magic Archive</h1>
          <p>Ancient spells, modern variants, Secret Lairs, promos, foils, etched printings, serialized cards, and every plane gathered into one collector archive.</p>
          <div className="mtg-actions">
            <Link className="mtg-button" href="/mtg/sets">Browse Sets</Link>
            <Link className="mtg-button secondary" href="/mtg/collection">Collection</Link>
            <Link className="mtg-button secondary" href="/mtg/decks">Decks</Link>
          </div>
        </section>

        <section className="mtg-grid">
          <div className="mtg-stat"><span>Sets</span><strong>{counts.sets}</strong></div>
          <div className="mtg-stat"><span>Cards</span><strong>{counts.cards}</strong></div>
          <div className="mtg-stat"><span>Printings</span><strong>{counts.printings}</strong></div>
          <div className="mtg-stat"><span>Owned</span><strong>{counts.ownedPrintings}</strong></div>
        </section>

        <section className="mtg-panel">
          <h2>Recent Printings</h2>
          <div className="mtg-card-grid">
            {recent.length ? recent.map((card: any) => <MtgCardTile key={card.id} card={card} />) : <p>Run the MTG importer to begin filling the archive.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
