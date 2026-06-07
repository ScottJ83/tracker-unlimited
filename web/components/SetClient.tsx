"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";

type Pill = { name: string; color: string };

function getAspectPills(aspect: string | null | undefined): Pill[] {
  const text = String(aspect || "").toLowerCase();
  const pills: Pill[] = [];

  if (text.includes("vigilance")) pills.push({ name: "Vigilance", color: "#3b82f6" });
  if (text.includes("command")) pills.push({ name: "Command", color: "#16a34a" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", color: "#dc2626" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", color: "#d97706" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", color: "#d4d4aa" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#7c3aed" });

  return pills;
}

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <span className="tu-card-chip-polished" style={{ color, borderColor: color }}>
      {label}: {value}
    </span>
  );
}

function CardImage({ src, name, hidden }: { src?: string | null; name: string; hidden?: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="tu-card-image-wrap-polished"
      onMouseEnter={() => {
        if (!hidden && src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {!hidden && src ? (
        <>
          <img src={src} alt={name} className="tu-card-image-polished" />
          {hover ? <img src={src} alt={name} className="tu-card-image-preview-polished" /> : null}
        </>
      ) : (
        <div className="tu-spoiler-question">?</div>
      )}
    </div>
  );
}

export default function SetClient({ cards, collection }: any) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");

  function getQty(cardId: string) {
    const entry = collection?.find((item: any) => item.card_id === cardId && item.quantity > 0);
    return entry ? Number(entry.quantity || 0) : 0;
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    return (cards || []).filter((card: any) => {
      const haystack = [card.name, card.subtitle, card.card_number, card.aspect, card.traits]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const textHaystack = [card.front_text, card.rarity, card.artist, card.cost, card.power, card.hp]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return (!q || haystack.includes(q)) && (!tq || textHaystack.includes(tq));
    });
  }, [cards, search, textSearch]);

  return (
    <div>
      <div className="tu-filter-bar">
        <input
          type="text"
          placeholder="Search name, number, aspect, or traits"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ minWidth: "280px", padding: "10px" }}
        />

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(event) => setTextSearch(event.target.value)}
          style={{ minWidth: "320px", padding: "10px" }}
        />

        <label style={{ display: "flex", gap: "8px", alignItems: "center", color: "#cfd7e4", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <input type="checkbox" checked={showMissing} onChange={(event) => setShowMissing(event.target.checked)} />
          Show Unowned
        </label>
      </div>

      <div className="tu-card-grid-polished">
        {filteredCards.map((card: any) => {
          const qty = getQty(card.id);
          const owned = qty > 0;
          const hidden = !showMissing && !owned;
          const aspectPills = getAspectPills(card.aspect);
          const price = Number(card?.price || 0);

          return (
            <div key={card.id} className={`tu-card-tile-polished ${owned ? "" : "is-unowned"}`}>
              <CardImage src={card.front_art} name={card.name || "Card"} hidden={hidden} />

              <div className="tu-card-body-polished">
                {hidden ? (
                  <>
                    <div className="tu-card-title-polished">Unowned Card</div>
                    <div className="tu-card-meta-polished">#{card.card_number ?? "-"}</div>
                    <div className="tu-card-meta-polished">Variant: {card.variant || "-"}</div>
                    <div className="tu-card-text-polished">Details hidden. Enable Show Unowned to reveal unowned card information.</div>
                    <div className="tu-card-value-row-polished"><span><strong>Qty:</strong> 0</span></div>
                  </>
                ) : (
                  <>
                    <div style={{ minWidth: 0 }}>
                      <div className="tu-card-title-polished">{card.name}</div>
                      <div className="tu-card-subtitle-polished">{card.subtitle || ""}</div>
                    </div>

                    <div className="tu-card-chip-row-polished">
                      <StatPill label="Cost" value={card.cost} color="#f5c542" />
                      <StatPill label="Power" value={card.power} color="#ef4444" />
                      <StatPill label="HP" value={card.hp} color="#3b82f6" />
                      {aspectPills.map((pill) => (
                        <span key={pill.name} className="tu-card-chip-polished" style={{ color: pill.color, borderColor: pill.color }}>
                          {pill.name}
                        </span>
                      ))}
                    </div>

                    <div className="tu-card-meta-polished">#{card.card_number ?? "-"} • {card.variant || "-"}</div>
                    <div className="tu-card-meta-polished">Traits: {card.traits || "-"}</div>
                    <div className="tu-card-text-polished">{card.front_text || "-"}</div>

                    <div className="tu-card-value-row-polished">
                      <span><strong>Qty:</strong> {qty}</span>
                      <span>Unit: ${price.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="tu-card-actions-polished">
                <AddCardButton cardId={card.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
