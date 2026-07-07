"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

export default function MtgCardsGalleryClient({ cards }: { cards: any[] }) {
  const [hideMissing, setHideMissing] = useState(true);
  const visibleCards = useMemo(() => hideMissing ? cards.filter((card) => card.isOwned) : cards, [cards, hideMissing]);

  return (
    <section className="mtg-panel">
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Binder View</p>
          <h2>Recent Printings</h2>
        </div>
        <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setHideMissing((value) => !value)}>
          {hideMissing ? "Show Missing" : "Hide Missing"}
        </button>
      </div>

      {visibleCards.length ? (
        <div className="mtg-card-grid">
          {visibleCards.map((card: any) => (
            <MtgCardTile key={card.id} card={card} muted={!card.isOwned} showControls compactControls />
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No owned cards in this view yet</h3>
          <p>Use “Show Missing” to reveal imported cards and add copies.</p>
        </div>
      )}
    </section>
  );
}
