import "../mtg.css";
import MtgCardTile from "@/components/mtg/MtgCardTile";
import { getMtgCounts, getMtgOwnedCollection, getMtgUser } from "@/lib/mtg/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, user } = await getMtgUser();
  const [counts, cards] = await Promise.all([
    getMtgCounts(supabase, user?.id),
    getMtgOwnedCollection(supabase, user?.id),
  ]);

  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero">
          <p className="mtg-kicker">Magic: The Gathering</p>
          <h1>Collection</h1>
          <p>{counts.ownedPrintings} owned printings across {counts.ownedCopies} total copies.</p>
        </section>

        <section className="mtg-panel">
          <div className="mtg-grid mtg-set-stat-grid">
            <div className="mtg-stat"><span>Owned Printings</span><strong>{counts.ownedPrintings}</strong></div>
            <div className="mtg-stat"><span>Owned Copies</span><strong>{counts.ownedCopies}</strong></div>
            <div className="mtg-stat"><span>Total Printings</span><strong>{counts.printings}</strong></div>
            <div className="mtg-stat"><span>Completion</span><strong>{counts.printCompletion}%</strong></div>
          </div>
        </section>

        <section className="mtg-panel">
          <div className="mtg-section-heading">
            <div>
              <p className="mtg-kicker">Owned Binder</p>
              <h2>Your MTG Collection</h2>
            </div>
          </div>

          {cards.length ? (
            <div className="mtg-card-grid">
              {cards.map((card: any) => <MtgCardTile key={card.id} card={card} showControls />)}
            </div>
          ) : (
            <div className="mtg-empty-state">
              <h3>No MTG cards added yet</h3>
              <p>Open a set, click “Show Missing,” and use the + buttons to add your first cards.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
