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

function StatPill({ label, value, color }: any) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      style={{
        fontSize: "10px",
        padding: "3px 6px",
        borderRadius: "999px",
        background: `${color}22`,
        border: `1px solid ${color}`,
        color,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {label}: {value}
    </div>
  );
}

function CardImage({ src, name }: any) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "56px",
        minWidth: "56px",
        height: "78px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#0b1220",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {src && (
        <>
          <img
            src={src}
            alt={name}
            style={{
              width: "56px",
              height: "78px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />

          {hover && (
            <img
              src={src}
              alt={name}
              style={{
                position: "absolute",
                top: "-18px",
                left: "66px",
                width: "220px",
                borderRadius: "12px",
                border: "1px solid #334155",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                zIndex: 999,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function CollectionClient({ data }: any) {
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const tq = textSearch.toLowerCase();

    let rows = (data || []).filter((item: any) => {
      const card = item.cards?.[0] || item.cards;

      const name = card?.name?.toLowerCase() || "";
      const text = card?.front_text?.toLowerCase() || "";

      return (!q || name.includes(q)) && (!tq || text.includes(tq));
    });

    rows.sort((a: any, b: any) => {
      const ac = a.cards?.[0] || a.cards;
      const bc = b.cards?.[0] || b.cards;

      const ap = (ac?.price || 0) * a.quantity;
      const bp = (bc?.price || 0) * b.quantity;

      if (sortBy === "price_asc") return ap - bp;
      return bp - ap;
    });

    return rows;
  }, [data, search, textSearch, sortBy]);

  return (
    <div>
      {/* SEARCH */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "10px" }}
        />

        <input
          placeholder="Search text..."
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          style={{ padding: "10px", borderRadius: "10px" }}
        />
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "14px",
        }}
      >
        {filtered.map((item: any) => {
          const card = item.cards?.[0] || item.cards;
          const aspectPills = getAspectPills(card?.aspect);

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #22c55e",
                borderRadius: "14px",
                padding: "10px",
                height: "155px",
                background: "#0f172a",
                display: "flex",
                gap: "10px",
                position: "relative",
              }}
            >
              <CardImage src={card?.front_art} name={card?.name} />

              <div style={{ flex: 1, paddingBottom: "40px" }}>
                {/* TOP */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{card?.name}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {card?.subtitle}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <StatPill label="Cost" value={card?.cost} color="#eab308" />
                      <StatPill label="Power" value={card?.power} color="#dc2626" />
                      <StatPill label="HP" value={card?.hp} color="#2563eb" />
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      {aspectPills.map((pill) => (
                        <div key={pill.name} style={{ fontSize: "9px" }}>
                          {pill.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MIDDLE */}
                <div style={{ fontSize: "11px", marginTop: "6px" }}>
                  #{card?.card_number} • {card?.variant}
                </div>

                <div style={{ fontSize: "11px" }}>
                  Qty: {item.quantity}
                </div>

                <div style={{ fontSize: "11px" }}>
                  Value: ${(card?.price || 0 * item.quantity).toFixed(2)}
                </div>
              </div>

              {/* BUTTONS */}
              <div style={{ position: "absolute", right: "10px", bottom: "8px" }}>
                <AddCardButton cardId={item.card_id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}