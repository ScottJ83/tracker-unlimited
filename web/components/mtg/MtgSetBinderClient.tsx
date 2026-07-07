"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

type Props = {
  printings: any[];
  defaultHideMissing?: boolean;
};

export default function MtgSetBinderClient({ printings, defaultHideMissing = true }: Props) {
  const [hideMissing, setHideMissing] = useState(defaultHideMissing);

  const visiblePrintings = useMemo(() => {
    if (!hideMissing) return printings;
    return printings.filter((printing) => printing.isOwned);
  }, [hideMissing, printings]);

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

        <button className="mtg-button secondary mtg-toggle-button" type="button" onClick={() => setHideMissing((value) => !value)}>
          {hideMissing ? "Show Missing" : "Hide Missing"}
        </button>
      </div>

      {visiblePrintings.length ? (
        <div className="mtg-card-grid">
          {visiblePrintings.map((printing: any) => (
            <div key={printing.id} className="mtg-set-printing-wrap">
              <MtgCardTile card={printing} muted={!printing.isOwned} showControls compactControls />
              <div className={printing.isOwned ? "mtg-owned-badge is-owned" : "mtg-owned-badge"}>
                {printing.isOwned ? `Owned ${printing.ownedCopies}` : "Missing"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No owned cards in this view yet</h3>
          <p>Use “Show Missing” to reveal the full set checklist, then add cards with the + buttons.</p>
        </div>
      )}
    </>
  );
}
