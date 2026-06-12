import Link from "next/link";
import { getPremadeDeckList } from "@/lib/swu/premadeDecks";

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default async function PremadeDecksPage() {
  const decks = await getPremadeDeckList();

  return (
    <main className="sw-page-shell premade-page-shell">
      <section className="sw-hero-block compact">
        <p className="sw-eyebrow">Deck Database</p>
        <h1>Pre-Made Decks</h1>
        <p className="sw-muted">Official starter and spotlight deck checklists tracked against your collection.</p>
      </section>

      <section className="premade-deck-grid">
        {decks.map((deck) => (
          <Link key={deck.id} href={`/swu/decks/premade/${deck.slug}`} className="premade-deck-tile sw-card-panel">
            <p className="sw-eyebrow">{deck.deck_type}</p>
            <h2>{deck.name}</h2>
            <p className="sw-muted small">{deck.product_wave}</p>

            <div className="premade-progress-row">
              <span>{deck.completion}% Complete</span>
              <span>{deck.ownedCopies} / {deck.requiredCopies}</span>
            </div>
            <div className="premade-progress-track"><span style={{ width: `${deck.completion}%` }} /></div>

            <div className="premade-tile-stats">
              <span>{deck.completedLines} / {deck.totalLines} cards complete</span>
              <span>Remaining {money(deck.remainingValue)}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
