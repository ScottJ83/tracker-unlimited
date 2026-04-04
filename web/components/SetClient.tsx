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

export default function SetClient({ cards, userId, collection }: any) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");

  function getQty(cardId: string) {
    const entry = collection?.find((c: any) => c.card_id === cardId && c.quantity > 0);
    return entry ? entry.quantity : 0;
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (cards || []).filter((card: any) => {
      const name = String(card.name || "").toLowerCase();
      const subtitle = String(card.subtitle || "").toLowerCase();
      const number = String(card.card_number || "").toLowerCase();
      const aspect = String(card.aspect || "").toLowerCase();

      if (
        q &&
        !name.includes(q) &&
        !subtitle.includes(q) &&
        !number.includes(q) &&
        !aspect.includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [cards, search]);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by number, name, or aspect"
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

        <label style={{ display: "flex", gap: "6px", alignItems: "center", color: "#cbd5e1" }}>
          <input
            type="checkbox"
            checked={showMissing}
            onChange={(e) => setShowMissing(e.target.checked)}
          />
          Show Missing Cards
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
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
                border: owned ? "1px solid #22c55e" : "1px solid #334155",
                borderRadius: "14px",
                padding: "10px",
                minHeight: "190px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: owned ? "#172033" : "#111827",
                boxShadow: owned ? "0 0 0 1px rgba(34,197,94,0.15)" : "none",
              }}
            >
              {hidden ? (
                <>
                  <div>
                    <div style={{ height: "18px" }} />
                    <div style={{ height: "18px" }} />

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                      {aspectPills.map((pill) => (
                        <div
                          key={pill.name}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
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

                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>#{card.card_number ?? "-"}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Variant: {card.variant}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Qty: 0</div>
                  </div>

<AddCardButton cardId={card.id} />                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: owned ? "#e5edf7" : "#9ca3af" }}>
                      {card.name}
                    </div>
                    <div style={{ color: owned ? "#94a3b8" : "#6b7280", fontSize: "12px", minHeight: "16px" }}>
                      {card.subtitle || ""}
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px", marginBottom: "6px" }}>
                      {aspectPills.map((pill) => (
                        <div
                          key={pill.name}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
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

                    <div style={{ fontSize: "12px", color: owned ? "#cbd5e1" : "#94a3b8" }}>
                      #{card.card_number ?? "-"}
                    </div>
                    <div style={{ fontSize: "12px", color: owned ? "#cbd5e1" : "#94a3b8" }}>
                      Variant: {card.variant}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        marginTop: "6px",
                        color: owned ? "#86efac" : "#94a3b8",
                        fontWeight: 700,
                      }}
                    >
                      Qty: {qty}
                    </div>
                  </div>

<AddCardButton cardId={card.id} />                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}