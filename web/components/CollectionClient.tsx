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

export default function CollectionClient({ data }: any) {
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [showImages, setShowImages] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      if (sortBy === "name_asc") return String(ac?.name || "").localeCompare(String(bc?.name || ""));
      if (sortBy === "name_desc") return String(bc?.name || "").localeCompare(String(ac?.name || ""));
      return bp - ap;
    });

    return rows;
  }, [data, search, textSearch, sortBy]);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search name, set, number, aspect, or traits"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            minWidth: "320px",
            padding: "10px 12px",
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
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        >
          <option value="price_desc">Price High-Low</option>
          <option value="price_asc">Price Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>

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
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "12px",
        }}
      >
        {filtered.map((item: any) => {
          const card = Array.isArray(item.cards) ? item.cards[0] : item.cards;
          const aspectPills = getAspectPills(card?.aspect);
          const unitValue = Number(card?.price || 0);
          const totalValue = unitValue * Number(item.quantity || 0);
          const hovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                border: "1px solid #22c55e",
                borderRadius: "14px",
                padding: "10px",
                minHeight: showImages ? "290px" : "230px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#172033",
                boxShadow: hovered
                  ? "0 12px 30px rgba(0,0,0,0.35)"
                  : "0 0 0 1px rgba(34,197,94,0.15)",
                transform: hovered ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.16s ease, box-shadow 0.16s ease",
                position: "relative",
                zIndex: hovered ? 10 : 1,
              }}
            >
              <div>
                {showImages && card?.front_art ? (
                  <img
                    src={card.front_art}
                    alt={card?.name}
                    style={{ width: "100%", borderRadius: "10px", marginBottom: "8px" }}
                  />
                ) : null}

                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", alignItems: "start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>
                      {card?.name || "Unknown card"}
                    </div>
                    <div style={{ color: "#94a3b8", marginBottom: "6px", fontSize: "11px" }}>
                      {card?.subtitle || ""}
                    </div>
                  </div>

                  <StatPill label="Cost" value={card?.cost} color="#eab308" />
                </div>

                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
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
                  <StatPill label="Power" value={card?.power} color="#dc2626" />
                  <StatPill label="HP" value={card?.hp} color="#2563eb" />
                </div>

                <div style={{ fontSize: "11px" }}>Set: {card?.set_code || "-"}</div>
                <div style={{ fontSize: "11px" }}>#{card?.card_number ?? "-"}</div>
                <div style={{ fontSize: "11px" }}>Variant: {card?.variant || "-"}</div>
                <div style={{ fontSize: "11px" }}>Traits: {card?.traits || "-"}</div>
                <div style={{ marginTop: "6px", color: "#86efac", fontWeight: 700, fontSize: "11px" }}>
                  Qty: {item.quantity}
                </div>
                <div style={{ fontSize: "11px", marginTop: "6px" }}>
                  Unit: ${unitValue.toFixed(2)}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700 }}>
                  Total: ${totalValue.toFixed(2)}
                </div>
              </div>

              <AddCardButton cardId={item.card_id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}