"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

export default function MtgCardsGalleryClient({ cards }: { cards: any[] }) {
  const [search, setSearch] = useState("");

  const visibleCards = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cards;

    return cards.filter((card: any) => {
      const haystack = [card?.display_name, card?.full_name, card?.mtg_cards?.name, card?.collector_number, card?.finish_label, card?.variant_label]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [cards, search]);

  return (
    <section className="mtg-panel">
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Binder View</p>
          <h2>Recent Printings</h2>
        </div>
        <input className="mtg-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search printings..." />
      </div>

      {visibleCards.length ? (
        <div className="mtg-card-grid mtg-binder-grid">
          {visibleCards.map((card: any) => (
            <MtgCardTile key={card.id} card={card} muted={!card.isOwned} showControls compactControls />
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No cards match that search</h3>
          <p>Clear the search field to return to the full list.</p>
        </div>
      )}
    </section>
  );
}
