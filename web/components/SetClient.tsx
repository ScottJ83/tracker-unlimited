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
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#4c1d95" });

  return pills;
}

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      style={{
        fontSize: "10px",
        padding: "2px 6px",
        borderRadius: "999px",
        background: `${color}22`,
        border: `1px solid ${color}`,
        color,
        fontWeight: 700,
      }}
    >
      {label}: {value}
    </div>
  );
}

/* 🔥 NEW IMAGE COMPONENT */
function CardImage({ src, name }: { src?: string | null; name: string }) {
  const [hover, setHover] = useState(false);

  if (!src) return null;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* SMALL IMAGE */}
      <img
        src={src}
        alt={name}
        style={{
          width: "60px",
          height: "84px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "1px solid #334155",
          cursor: "pointer",
        }}
      />

      {/* HOVER PREVIEW */}
      {hover && (
        <img
          src={src}
          alt={name}
          style={{
            position: "absolute",
            top: "-20px",
            left: "70px",
            width: "240px",
            borderRadius: "12px",
            border: "1px solid #334155",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            zIndex: 999,
            background: "#02040a",
          }}
        />
      )}
    </div>
  );
}

export default function SetClient({ cards, collection }: any) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");

  function getQty(cardId: string) {
    const entry = collection?.find((c: any) => c.card_id === cardId && c.quantity > 0);
    return entry ? entry.quantity : 0;
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    return (cards || []).filter((card: any) => {
      const name = String(card.name || "").toLowerCase();
      const subtitle = String(card.subtitle || "").toLowerCase();
      const number = String(card.card_number || "").toLowerCase();
      const aspect = String(card.aspect || "").toLowerCase();
      const traits = String(card.traits || "").toLowerCase();

      const frontText = String(card.front_text || "").toLowerCase();
      const rarity = String(card.rarity || "").toLowerCase();
      const artist = String(card.artist || "").toLowerCase();
      const cost = String(card.cost ?? "").toLowerCase();
      const power = String(card.power ?? "").toLowerCase();
      const hp = String(card.hp ?? "").toLowerCase();

      const mainMatch =
        !q ||
        name.includes(q) ||
        subtitle.includes(q) ||
        number.includes(q) ||
        aspect.includes(q) ||
        traits.includes(q);

      const textMatch =
        !tq ||
        frontText.includes(tq) ||
        rarity.includes(tq) ||
        artist.includes(tq) ||
        cost.includes(tq) ||
        power.includes(tq) ||
        hp.includes(tq);

      return mainMatch && textMatch;
    });
  }, [cards, search, textSearch]);

  return (
    <div>
      {/* SEARCH UI (unchanged) */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search name, number, aspect, or traits"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            minWidth: "280px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        />

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          style={{
            minWidth: "320px",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        />

        <label style={{ display: "flex", gap: "6px", alignItems: "center", color: "#cbd5e1" }}>
          <input
            type="checkbox"
            checked={showMissing}
            onChange={(e) => setShowMissing(e.target.checked)}
          />
          Show Missing
        </label>
      </div>

      {/* 🔥 GRID UPDATED (4 per row feel) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "14px",
        }}
      >
        {filteredCards.map((card: any) => {
          const qty = getQty(card.id);
          const owned = qty > 0;
          const hidden = !showMissing && !owned;
          const aspectPills = getAspectPills(card.aspect);

          return (
            <div
              key={card.id}
              style={{
                border: owned ? "1px solid #22c55e" : "1px solid #2a3445",
                borderRadius: "14px",
                padding: "12px",
                Height: "100px",
                background: owned ? "#0f172a" : "#05070d",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* LEFT SIDE (IMAGE) */}
<div style={{ width: "60px", minWidth: "60px" }}>
  {!hidden ? <CardImage src={card.front_art} name={card.name} /> : null}
</div>

              {/* RIGHT SIDE */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {hidden ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      #{card.card_number ?? "-"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Variant: {card.variant}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Qty: 0
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#e5edf7" }}>
                        {card.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {card.subtitle || ""}
                      </div>

                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                        {aspectPills.map((pill) => (
                          <div
                            key={pill.name}
                            style={{
                              fontSize: "9px",
                              padding: "2px 5px",
                              borderRadius: "999px",
                              background: `${pill.color}22`,
                              border: `1px solid ${pill.color}`,
                              color: pill.color,
                            }}
                          >
                            {pill.name}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                        <StatPill label="Cost" value={card.cost} color="#eab308" />
                        <StatPill label="Power" value={card.power} color="#dc2626" />
                        <StatPill label="HP" value={card.hp} color="#2563eb" />
                      </div>

                      <div style={{ fontSize: "11px", marginTop: "6px", color: "#cbd5e1" }}>
                        #{card.card_number} • {card.variant}
                      </div>

                      <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                        Traits: {card.traits || "-"}
                      </div>

                      <div style={{ fontSize: "12px", marginTop: "6px", color: "#86efac", fontWeight: 700 }}>
                        Qty: {qty}
                      </div>
                    </div>
                  </>
                )}

                <AddCardButton cardId={card.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}