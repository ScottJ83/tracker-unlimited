"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";
import CardTile from "./CardTile";

export default function CollectionClient({ data }: any) {
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    let rows = (data || []).filter((item: any) => {
      const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;

      const name = String(card?.name || "").toLowerCase();
      const subtitle = String(card?.subtitle || "").toLowerCase();
      const setCode = String(card?.set_code || "").toLowerCase();
      const number = String(card?.card_number || "").toLowerCase();
      const aspect = String(card?.aspect || "").toLowerCase();
      const traits = String(card?.traits || "").toLowerCase();

      const frontText = String(card?.front_text || "").toLowerCase();
      const rarity = String(card?.rarity || "").toLowerCase();
      const artist = String(card?.artist || "").toLowerCase();
      const cost = String(card?.cost ?? "").toLowerCase();
      const power = String(card?.power ?? "").toLowerCase();
      const hp = String(card?.hp ?? "").toLowerCase();

      const mainMatch =
        !q ||
        name.includes(q) ||
        subtitle.includes(q) ||
        setCode.includes(q) ||
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

    rows.sort((a: any, b: any) => {
      const ac = Array.isArray(a.cards) ? a.cards[0] : a.cards;
      const bc = Array.isArray(b.cards) ? b.cards[0] : b.cards;

      const ap = Number(ac?.price || 0) * Number(a.quantity || 0);
      const bp = Number(bc?.price || 0) * Number(b.quantity || 0);

      if (sortBy === "price_asc") return ap - bp;
      if (sortBy === "name_asc") {
        return String(ac?.name || "").localeCompare(String(bc?.name || ""));
      }
      if (sortBy === "name_desc") {
        return String(bc?.name || "").localeCompare(String(ac?.name || ""));
      }
      return bp - ap;
    });

    return rows;
  }, [data, search, textSearch, sortBy]);

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
          placeholder="Search name, set, number, aspect, or traits"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...controlStyle, minWidth: "320px" }}
        />

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          style={{ ...controlStyle, minWidth: "320px" }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={controlStyle}
        >
          <option value="price_desc">Price High-Low</option>
          <option value="price_asc">Price Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "14px",
        }}
      >
        {filtered.map((item: any) => {
          const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;
          const unitValue = Number(card?.price || 0);
          const totalValue = unitValue * Number(item.quantity || 0);

          return (
            <CardTile
              key={item.id}
              card={card}
              owned
              showSetLine
              footerItems={[
                { label: "Qty", value: item.quantity, color: "#8ef0ba", bold: true },
                { label: "Unit", value: `$${unitValue.toFixed(2)}`, color: "#d6e3f3" },
                { label: "Total", value: `$${totalValue.toFixed(2)}`, color: "#edf4ff", bold: true },
              ]}
              actionSlot={<AddCardButton cardId={item.card_id} />}
            />
          );
        })}
      </div>
    </div>
  );
}