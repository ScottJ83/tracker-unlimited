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

export default function CollectionClient({ data, userId }: any) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = (data || []).filter((item: any) => {
      if (!q) return true;

      const name = String(item.cards?.name || "").toLowerCase();
      const subtitle = String(item.cards?.subtitle || "").toLowerCase();
      const setCode = String(item.cards?.set_code || "").toLowerCase();
      const number = String(item.cards?.card_number || "").toLowerCase();
      const aspect = String(item.cards?.aspect || "").toLowerCase();

      return (
        name.includes(q) ||
        subtitle.includes(q) ||
        setCode.includes(q) ||
        number.includes(q) ||
        aspect.includes(q)
      );
    });

    rows.sort((a: any, b: any) => {
      const ap = Number(a.cards?.price || 0) * Number(a.quantity || 0);
      const bp = Number(b.cards?.price || 0) * Number(b.quantity || 0);

      if (sortBy === "price_asc") return ap - bp;
      if (sortBy === "name_asc") return String(a.cards?.name || "").localeCompare(String(b.cards?.name || ""));
      if (sortBy === "name_desc") return String(b.cards?.name || "").localeCompare(String(a.cards?.name || ""));
      return bp - ap;
    });

    return rows;
  }, [data, search, sortBy]);

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by number, name, set, or aspect"
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {filtered.map((item: any) => {
          const aspectPills = getAspectPills(item.cards?.aspect);
          const unitValue = Number(item.cards?.price || 0);
          const totalValue = unitValue * Number(item.quantity || 0);

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #22c55e",
                borderRadius: "14px",
                padding: "10px",
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#172033",
                boxShadow: "0 0 0 1px rgba(34,197,94,0.15)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>
                  {item.cards?.name || "Unknown card"}
                </div>
                <div style={{ color: "#94a3b8", marginBottom: "6px", fontSize: "12px" }}>
                  {item.cards?.subtitle || ""}
                </div>

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

                <div style={{ fontSize: "12px" }}>Set: {item.cards?.set_code || "-"}</div>
                <div style={{ fontSize: "12px" }}>#{item.cards?.card_number ?? "-"}</div>
                <div style={{ fontSize: "12px" }}>Variant: {item.cards?.variant || "-"}</div>
                <div style={{ marginTop: "6px", color: "#86efac", fontWeight: 700, fontSize: "12px" }}>
                  Qty: {item.quantity}
                </div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>
                  Unit: ${unitValue.toFixed(2)}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700 }}>
                  Total: ${totalValue.toFixed(2)}
                </div>
              </div>

              <AddCardButton userId={userId} cardId={item.card_id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}