"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

type Props = { printings: any[] };

export default function MtgSetBinderClient({ printings }: Props) {
  const [revealUnowned, setRevealUnowned] = useState(false);
  const [search, setSearch] = useState("");

  const visiblePrintings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return printings;
    return printings.filter((printing) => {
      const name = String(printing?.mtg_cards?.name || "").toLowerCase();
      const number = String(printing?.collector_number || "").toLowerCase();
      const type = String(printing?.mtg_cards?.type_line || "").toLowerCase();
      const finish = String(printing?.finish_label || printing?.finish || "").toLowerCase();
      return name.includes(term) || number.includes(term) || type.includes(term) || finish.includes(term);
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
          <p className="mtg-small-note">Showing {visiblePrintings.length} of {printings.length} printings • {ownedCount} owned • {missingCount} missing</p>
        </div>

        <div className="mtg-toolbar-actions">
          <input className="mtg-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cards, numbers, types..." />
          <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setRevealUnowned((value) => !value)}>
            {revealUnowned ? "Hide Unowned Cards" : "Reveal Unowned Cards"}
          </button>
        </div>
      </div>

      {visiblePrintings.length ? (
        <div className="mtg-binder-grid">
          {visiblePrintings.map((printing: any) => (
            <div key={printing.id} className="mtg-set-printing-wrap">
              <MtgCardTile card={printing} muted={!printing.isOwned} showControls compactControls revealUnowned={revealUnowned} />
              <div className={printing.isOwned ? "mtg-owned-badge is-owned" : "mtg-owned-badge"}>{printing.isOwned ? `Owned ${printing.ownedCopies}` : "Missing"}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state"><h3>No cards match that search</h3><p>Clear the search to return to the full set checklist.</p></div>
      )}
    </>
  );
}
