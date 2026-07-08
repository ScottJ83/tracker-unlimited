"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

type Props = {
  printings: any[];
  defaultHideMissing?: boolean;
};

export default function MtgSetBinderClient({ printings }: Props) {
  const [search, setSearch] = useState("");

  const visiblePrintings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return printings;

    return printings.filter((printing: any) => {
      const haystack = [
        printing?.display_name,
        printing?.full_name,
        printing?.mtg_cards?.name,
        printing?.mtg_cards?.type_line,
        printing?.collector_number,
        printing?.finish_label,
        printing?.variant_label,
        printing?.collectible_type,
      ].join(" ").toLowerCase();

      return haystack.includes(term);
    });
  }, [printings, search]);

  const ownedCount = printings.filter((printing) => printing.isOwned).length;
  const missingCount = printings.length - ownedCount;

  return (
    <>
      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Set Binder</p>
          <h2>Printings</h2>
          <p className="mtg-small-note">
            Showing {visiblePrintings.length} of {printings.length} printings • {ownedCount} owned • {missingCount} missing
          </p>
        </div>

        <input
          className="mtg-search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search this set..."
        />
      </div>

      {visiblePrintings.length ? (
        <div className="mtg-card-grid mtg-binder-grid">
          {visiblePrintings.map((printing: any) => (
            <div key={printing.id} className="mtg-set-printing-wrap">
              <MtgCardTile card={printing} muted={!printing.isOwned} showControls compactControls />
              <div className={printing.isOwned ? "mtg-owned-badge is-owned" : "mtg-owned-badge"}>
                {printing.isOwned ? `Owned ${printing.ownedCopies}` : "Unowned"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No cards match that search</h3>
          <p>Clear the search field to return to the full set checklist.</p>
        </div>
      )}
    </>
  );
}
