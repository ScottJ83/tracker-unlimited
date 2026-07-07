"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

type Props = {
  printings: any[];
};

export default function MtgSetBinderClient({ printings }: Props) {
  const [showImages, setShowImages] = useState(false);
  const [search, setSearch] = useState("");

  const visiblePrintings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return printings;

    return printings.filter((printing) => {
      const name = String(printing?.mtg_cards?.name || printing?.name || "").toLowerCase();
      const typeLine = String(printing?.mtg_cards?.type_line || printing?.type_line || "").toLowerCase();
      const setCode = String(printing?.set_code || "").toLowerCase();
      const number = String(printing?.collector_number || "").toLowerCase();
      const rarity = String(printing?.rarity || "").toLowerCase();
      return name.includes(q) || typeLine.includes(q) || setCode.includes(q) || number.includes(q) || rarity.includes(q);
    });
  }, [printings, search]);

  const ownedCount = printings.filter((printing) => printing.isOwned).length;
  const missingCount = printings.length - ownedCount;

  return (
    <>
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Set Checklist</p>
          <h2>Printings</h2>
          <p className="mtg-small-note">
            {visiblePrintings.length} shown • {ownedCount} owned • {missingCount} unowned
          </p>
        </div>

        <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setShowImages((value) => !value)}>
          {showImages ? "Hide Card Art" : "Show Card Art"}
        </button>
      </div>

      <div className="mtg-filter-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, type, rarity, set code, or number..."
          aria-label="Search MTG set printings"
        />
      </div>

      {visiblePrintings.length ? (
        <div className="mtg-card-list">
          {visiblePrintings.map((printing: any) => (
            <MtgCardTile
              key={printing.id}
              card={printing}
              muted={!printing.isOwned}
              showControls
              compactControls
              revealUnownedImages={showImages}
            />
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No cards match that search</h3>
          <p>Clear the search to return to the full set checklist.</p>
        </div>
      )}
    </>
  );
}
