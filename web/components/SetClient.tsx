"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";
import CardTile from "./CardTile";

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

  const controlStyle = {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    background:
      "linear-gradient(180deg, rgba(10, 18, 33, 0.98), rgba(7, 12, 24, 0.98))",
    color: "#edf4ff",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
  } as const;

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search name, number, aspect, or traits"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...controlStyle, minWidth: "280px" }}
        />

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          style={{ ...controlStyle, minWidth: "320px" }}
        />

        <label style={{ display: "flex", gap: "6px", alignItems: "center", color: "#d6e3f3" }}>
          <input
            type="checkbox"
            checked={showMissing}
            onChange={(e) => setShowMissing(e.target.checked)}
          />
          Show Missing
        </label>
      </div>

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
          const unitValue = Number(card?.price || 0);
          const totalValue = unitValue * qty;

          return (
            <CardTile
              key={card.id}
              card={card}
              owned={owned}
              hidden={hidden}
              footerItems={[
                { label: "Qty", value: qty, color: owned ? "#8ef0ba" : "#9fb0c8", bold: true },
                { label: "Unit", value: `$${unitValue.toFixed(2)}`, color: "#d6e3f3" },
                { label: "Total", value: `$${totalValue.toFixed(2)}`, color: "#edf4ff", bold: owned },
              ]}
              actionSlot={owned ? <AddCardButton cardId={card.id} /> : null}
            />
          );
        })}
      </div>
    </div>
  );
}