"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

function haystack(card: any) {
  const linked = Array.isArray(card?.mtg_cards) ? card.mtg_cards[0] : card?.mtg_cards;
  return [
    linked?.name,
    linked?.type_line,
    card?.set_code,
    card?.collector_number,
    card?.rarity,
    card?.lang,
    ...(Array.isArray(card?.finishes) ? card.finishes : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

export default function MtgCardsGalleryClient({ cards }: { cards: any[] }) {
  const [hideMissing, setHideMissing] = useState(true);
  const [search, setSearch] = useState("");

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (cards || []).filter((card) => {
      if (hideMissing && !card.isOwned) return false;
      return !q || haystack(card).includes(q);
    });
  }, [cards, hideMissing, search]);

  const ownedCount = cards.filter((card) => card.isOwned).length;
  const missingCount = cards.length - ownedCount;

  return (
    <section className="mtg-panel">
      <section className="mtg-filter-panel">
        <input
          type="text"
          placeholder="Search name, set, number, rarity, finish, or type"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="mtg-checkbox-label">
          <input type="checkbox" checked={!hideMissing} onChange={(event) => setHideMissing(!event.target.checked)} />
          Show Unowned
        </label>
      </section>

      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Card Archive</p>
          <h2>Recent Printings</h2>
          <p className="mtg-small-note">Showing {visibleCards.length} of {cards.length} printings • {ownedCount} owned • {missingCount} missing</p>
        </div>
      </div>

      {visibleCards.length ? (
        <div className="mtg-card-grid mtg-list-card-grid">
          {visibleCards.map((card: any) => (
            <MtgCardTile key={card.id} card={card} muted={!card.isOwned} showControls compactControls />
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No owned cards in this view yet</h3>
          <p>Enable “Show Unowned” to reveal imported cards and add copies.</p>
        </div>
      )}
    </section>
  );
}
