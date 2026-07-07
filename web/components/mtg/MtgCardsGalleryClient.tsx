"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

export default function MtgCardsGalleryClient({ cards }: { cards: any[] }) {
  const [showImages, setShowImages] = useState(false);
  const [search, setSearch] = useState("");

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;

    return cards.filter((card) => {
      const name = String(card?.mtg_cards?.name || card?.name || "").toLowerCase();
      const typeLine = String(card?.mtg_cards?.type_line || card?.type_line || "").toLowerCase();
      const setCode = String(card?.set_code || "").toLowerCase();
      const number = String(card?.collector_number || "").toLowerCase();
      return name.includes(q) || typeLine.includes(q) || setCode.includes(q) || number.includes(q);
    });
  }, [cards, search]);

  const owned = cards.filter((card) => card.isOwned).length;

  return (
    <section className="mtg-panel">
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Archive View</p>
          <h2>Recent Printings</h2>
          <p className="mtg-small-note">Showing {visibleCards.length} of {cards.length} imported printings • {owned} owned</p>
        </div>
        <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setShowImages((value) => !value)}>
          {showImages ? "Hide Card Images" : "Show Card Images"}
        </button>
      </div>

      <div className="mtg-filter-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search cards, types, set code, or number..."
          aria-label="Search MTG cards"
        />
      </div>

      {visibleCards.length ? (
        <div className="mtg-card-list">
          {visibleCards.map((card: any) => (
            <MtgCardTile
              key={card.id}
              card={card}
              muted={!card.isOwned}
              showControls
              compactControls
              revealUnownedImages={showImages}
            />
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No cards match that search</h3>
          <p>Clear the search to return to the imported MTG archive.</p>
        </div>
      )}
    </section>
  );
}
