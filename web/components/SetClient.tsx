"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";

function getAspectPills(aspect: string | null | undefined) {
  const text = String(aspect || "").toLowerCase();
  const pills: { name: string; color: string }[] = [];
  if (text.includes("vigilance")) pills.push({ name: "Vigilance", color: "#3b82f6" });
  if (text.includes("command")) pills.push({ name: "Command", color: "#16a34a" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", color: "#dc2626" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", color: "#d97706" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", color: "#d4d4aa" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#7c3aed" });
  return pills;
}

function getCardDisplayName(card: any) {
  return card?.subtitle ? `${card.name}: ${card.subtitle}` : card?.name || "Unknown card";
}

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  if (value === null || value === undefined || value === "") return null;
  return <span className="tu-aspect-pill" style={{ borderColor: color, color }}>{label}: {value}</span>;
}

function CardImage({ src, name, hidden }: { src?: string | null; name: string; hidden?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="tu-card-image-wrap" onMouseEnter={() => { if (!hidden && src) setHover(true); }} onMouseLeave={() => setHover(false)}>
      {!hidden && src ? (
        <>
          <img src={src} alt={name} className="tu-card-image" />
          {hover ? <img src={src} alt={name} className="tu-card-image-preview" /> : null}
        </>
      ) : <div className="tu-spoiler-card">?</div>}
    </div>
  );
}

export default function SetClient({ cards, collection }: any) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");

  function getQty(cardId: string) {
    const entry = collection?.find((c: any) => c.card_id === cardId && Number(c.quantity || 0) > 0);
    return entry ? Number(entry.quantity || 0) : 0;
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();
    return (cards || []).filter((card: any) => {
      const mainHaystack = [card?.name, card?.subtitle, card?.set_code, card?.card_number, card?.aspect, card?.traits, card?.variant].filter(Boolean).join(" ").toLowerCase();
      const textHaystack = [card?.front_text, card?.rarity, card?.artist, card?.cost, card?.power, card?.hp, card?.card_type, card?.arena].filter((v) => v !== null && v !== undefined).join(" ").toLowerCase();
      return (!q || mainHaystack.includes(q)) && (!tq || textHaystack.includes(tq));
    });
  }, [cards, search, textSearch]);

  return (
    <div>
      <section className="tu-filter-panel">
        <input type="text" placeholder="Search name, number, aspect, or traits" value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: "280px" }} />
        <input type="text" placeholder="Search text, rarity, artist, cost, power, or hp" value={textSearch} onChange={(e) => setTextSearch(e.target.value)} style={{ minWidth: "320px" }} />
        <label className="tu-checkbox-label"><input type="checkbox" checked={showMissing} onChange={(e) => setShowMissing(e.target.checked)} />Show Unowned</label>
      </section>

      <div className="tu-card-grid">
        {filteredCards.map((card: any) => {
          const qty = getQty(card.id);
          const owned = qty > 0;
          const hidden = !showMissing && !owned;
          const aspectPills = getAspectPills(card.aspect);
          const unitValue = Number(card?.price || 0);
          const totalValue = unitValue * qty;
          const displayName = getCardDisplayName(card);
          return (
            <div key={card.id} className="tu-card-tile">
              <CardImage src={card.front_art} name={displayName} hidden={hidden} />
              <div className="tu-card-body">
                {hidden ? (
                  <>
                    <div className="tu-card-title">Unowned Card</div>
                    <div className="tu-card-meta">{card?.set_code || "-"} #{card?.card_number ?? "-"}</div>
                    <div className="tu-card-meta">Variant: {card?.variant || "-"}</div>
                    <div className="tu-card-text">Details hidden. Enable Show Unowned to reveal unowned card information.</div>
                    <div className="tu-card-value-row"><span className="tu-card-price">Qty: 0</span></div>
                  </>
                ) : (
                  <>
                    <div className="tu-card-title">{displayName}</div>
                    <div className="tu-card-meta">{card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}</div>
                    <div className="tu-pill-row">
                      <StatPill label="Cost" value={card?.cost} color="#eab308" />
                      <StatPill label="Power" value={card?.power} color="#dc2626" />
                      <StatPill label="HP" value={card?.hp} color="#3b82f6" />
                      {aspectPills.map((pill) => <span key={pill.name} className="tu-aspect-pill" style={{ borderColor: pill.color, color: pill.color }}>{pill.name}</span>)}
                    </div>
                    <div className="tu-card-meta">Traits: {card?.traits || "-"}</div>
                    <div className="tu-card-text">{card?.front_text || "-"}</div>
                    <div className="tu-card-value-row">
                      <span className="tu-card-price">Qty: {qty}</span>
                      <span className="tu-card-meta">Unit: ${unitValue.toFixed(2)}</span>
                      <span className="tu-card-price">Total: ${totalValue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="tu-card-actions"><AddCardButton cardId={card.id} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
