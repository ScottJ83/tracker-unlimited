"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

export default function MtgCardsGalleryClient({ cards }: { cards: any[] }) {
  const [revealUnowned, setRevealUnowned] = useState(false);
  const [search, setSearch] = useState("");

  const visibleCards = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cards;
    return cards.filter((card) => {
      const name = String(card?.mtg_cards?.name || "").toLowerCase();
      const number = String(card?.collector_number || "").toLowerCase();
      const type = String(card?.mtg_cards?.type_line || "").toLowerCase();
      return name.includes(term) || number.includes(term) || type.includes(term);
    });
  }, [cards, search]);

  return (
    <section className="mtg-panel">
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Binder View</p>
          <h2>Recent Printings</h2>
        </div>
        <div className="mtg-toolbar-actions">
          <input className="mtg-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards..." />
          <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setRevealUnowned((value) => !value)}>
            {revealUnowned ? "Hide Unowned Cards" : "Reveal Unowned Cards"}
          </button>
        </div>
      </div>

      <div className="mtg-binder-grid">
        {visibleCards.map((card: any) => <MtgCardTile key={card.id} card={card} muted={!card.isOwned} showControls compactControls revealUnowned={revealUnowned} />)}
      </div>
    </section>
  );
}
