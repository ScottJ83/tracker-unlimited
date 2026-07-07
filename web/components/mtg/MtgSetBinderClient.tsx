"use client";

import { useMemo, useState } from "react";
import MtgCardTile from "./MtgCardTile";

type Props = {
  printings: any[];
  defaultHideMissing?: boolean;
};

function haystack(printing: any) {
  const card = Array.isArray(printing?.mtg_cards) ? printing.mtg_cards[0] : printing?.mtg_cards;
  return [
    card?.name,
    card?.type_line,
    printing?.set_code,
    printing?.collector_number,
    printing?.rarity,
    printing?.lang,
    printing?.layout,
    ...(Array.isArray(printing?.finishes) ? printing.finishes : []),
    ...(Array.isArray(printing?.promo_types) ? printing.promo_types : []),
    ...(Array.isArray(printing?.frame_effects) ? printing.frame_effects : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

export default function MtgSetBinderClient({ printings, defaultHideMissing = true }: Props) {
  const [hideMissing, setHideMissing] = useState(defaultHideMissing);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");

  const filteredPrintings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    return (printings || []).filter((printing) => {
      if (hideMissing && !printing.isOwned) return false;
      const main = haystack(printing);
      const text = [
        printing?.artist,
        printing?.security_stamp,
        printing?.border_color,
        printing?.price_usd,
        printing?.price_usd_foil,
        printing?.price_usd_etched,
      ].filter(Boolean).join(" ").toLowerCase();

      return (!q || main.includes(q)) && (!tq || text.includes(tq));
    });
  }, [hideMissing, printings, search, textSearch]);

  const ownedCount = printings.filter((printing) => printing.isOwned).length;
  const missingCount = printings.length - ownedCount;

  return (
    <div>
      <section className="mtg-filter-panel">
        <input
          type="text"
          placeholder="Search name, number, rarity, finish, or type"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          type="text"
          placeholder="Search artist, stamp, border, or price"
          value={textSearch}
          onChange={(event) => setTextSearch(event.target.value)}
        />
        <label className="mtg-checkbox-label">
          <input type="checkbox" checked={!hideMissing} onChange={(event) => setHideMissing(!event.target.checked)} />
          Show Unowned
        </label>
      </section>

      <div className="mtg-section-heading mtg-binder-toolbar">
        <div>
          <p className="mtg-kicker">Set Binder</p>
          <h2>Printings</h2>
          <p className="mtg-small-note">
            Showing {filteredPrintings.length} of {printings.length} printings • {ownedCount} owned • {missingCount} missing
          </p>
        </div>
      </div>

      {filteredPrintings.length ? (
        <div className="mtg-card-grid mtg-list-card-grid">
          {filteredPrintings.map((printing: any) => {
            const hidden = !printing.isOwned && !hideMissing;
            return (
              <MtgCardTile
                key={printing.id}
                card={printing}
                muted={!printing.isOwned && !hidden}
                hidden={hidden}
                showControls
                compactControls
              />
            );
          })}
        </div>
      ) : (
        <div className="mtg-empty-state">
          <h3>No owned cards in this view yet</h3>
          <p>Enable “Show Unowned” to reveal the full set checklist, then use the + buttons to add cards.</p>
        </div>
      )}
    </div>
  );
}
