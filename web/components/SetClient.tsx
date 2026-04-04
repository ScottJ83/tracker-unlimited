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

export default function SetClient({ cards, collection }: any) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [showImages, setShowImages] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

        <label style={{ display: "flex", gap: "6px", alignItems: "center", color: "#cbd5e1" }}>
          <input
            type="checkbox"
            checked={showImages}
            onChange={(e) => setShowImages(e.target.checked)}
          />
          Show Images
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "12px",
        }}
      >
        {filteredCards.map((card: any) => {
          const qty = getQty(card.id);
          const owned = qty > 0;
          const hidden = !showMissing && !owned;
          const aspectPills = getAspectPills(card.aspect);
          const hovered = hoveredId === card.id;

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                border: owned ? "1px solid #22c55e" : "1px solid #334155",
                borderRadius: "14px",
                padding: hidden ? "8px" : "10px",
                minHeight: hidden ? "120px" : showImages ? "285px" : "215px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: owned ? "#172033" : "#111827",
                boxShadow: hovered
                  ? "0 12px 30px rgba(0,0,0,0.35)"
                  : owned
                  ? "0 0 0 1px rgba(34,197,94,0.15)"
                  : "none",
                transform: hovered ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.16s ease, box-shadow 0.16s ease",
                position: "relative",
                zIndex: hovered ? 10 : 1,
              }}
            >
              {hidden ? (
                <>
                  <div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>#{card.card_number ?? "-"}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{card.name}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Variant: {card.variant}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Qty: 0</div>
                  </div>
                  <AddCardButton cardId={card.id} />
                </>
              ) : (
                <>
                  <div>
                    {showImages && card.front_art ? (
                      <img
                        src={card.front_art}
                        alt={card.name}
                        style={{
                          width: "100%",
                          borderRadius: "10px",
                          marginBottom: "8px",
                        }}
                      />
                    ) : null}

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: owned ? "#e5edf7" : "#9ca3af" }}>
                          {card.name}
                        </div>
                        <div style={{ color: owned ? "#94a3b8" : "#6b7280", fontSize: "11px", minHeight: "14px" }}>
                          {card.subtitle || ""}
                        </div>
                      </div>

                      <StatPill label="Cost" value={card.cost} color="#eab308" />
                    </div>

                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px", marginBottom: "6px" }}>
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

                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
                      <StatPill label="Power" value={card.power} color="#dc2626" />
                      <StatPill label="HP" value={card.hp} color="#2563eb" />
                    </div>

                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>#{card.card_number ?? "-"}</div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>Variant: {card.variant}</div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1" }}>Traits: {card.traits || "-"}</div>
                    <div style={{ fontSize: "11px", marginTop: "6px", color: owned ? "#86efac" : "#94a3b8", fontWeight: 700 }}>
                      Qty: {qty}
                    </div>
                  </div>

                  <AddCardButton cardId={card.id} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}