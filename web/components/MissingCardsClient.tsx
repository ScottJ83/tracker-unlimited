"use client";

import { useMemo, useState } from "react";
import WishlistButton from "./WishlistButton";

function getCardDisplayName(card: any) {
  return card?.subtitle ? `${card.name}: ${card.subtitle}` : card?.name || "Unknown card";
}

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

function CardImage({ src, name }: { src?: string | null; name: string }) {
  return (
    <div
      style={{
        width: "56px",
        minWidth: "56px",
        height: "78px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "#0b1220",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "56px",
            height: "78px",
            objectFit: "cover",
            borderRadius: "8px",
            display: "block",
          }}
        />
      ) : (
        <div style={{ fontSize: "10px", color: "#475569" }}>—</div>
      )}
    </div>
  );
}

export default function MissingCardsClient({
  cards,
  wantedIds,
}: {
  cards: any[];
  wantedIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("all");
  const [sortBy, setSortBy] = useState("value_desc");
  const [showCards, setShowCards] = useState(false);

  const wantedSet = useMemo(() => new Set(wantedIds || []), [wantedIds]);

  const setOptions = useMemo(() => {
    return Array.from(new Set((cards || []).map((card) => card.set_code)))
      .filter(Boolean)
      .sort();
  }, [cards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = (cards || []).filter((card) => {
      const haystack = [
        card?.name,
        card?.subtitle,
        card?.set_code,
        card?.card_number,
        card?.variant,
        card?.aspect,
        card?.traits,
        card?.card_type,
        card?.arena,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatches = !q || haystack.includes(q);
      const setMatches = setFilter === "all" || card?.set_code === setFilter;

      return searchMatches && setMatches;
    });

    rows.sort((a, b) => {
      if (sortBy === "value_asc") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "name_asc") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "set_number") {
        const setCompare = String(a.set_code || "").localeCompare(String(b.set_code || ""));
        if (setCompare !== 0) return setCompare;
        return Number(a.card_number || 0) - Number(b.card_number || 0);
      }
      return Number(b.price || 0) - Number(a.price || 0);
    });

    return rows;
  }, [cards, search, setFilter, sortBy]);

  const totalMissingValue = filtered.reduce(
    (sum, card) => sum + Number(card?.price || 0),
    0
  );

  const wantedVisibleCount = filtered.filter((card) => wantedSet.has(card.id)).length;
  const wantedVisibleValue = filtered.reduce(
    (sum, card) => sum + (wantedSet.has(card.id) ? Number(card?.price || 0) : 0),
    0
  );

  return (
    <div>
      <div
        style={{
          marginBottom: "18px",
          padding: "18px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "linear-gradient(180deg, #172033, #111827)",
          display: "grid",
          gap: "8px",
          color: "#e5edf7",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "16px" }}>Missing Summary</div>
        <div>Visible Missing Cards: {filtered.length}</div>
        <div>Visible Missing Value: ${totalMissingValue.toFixed(2)}</div>
        <div>Wanted From Visible Missing: {wantedVisibleCount}</div>
        <div>Wanted Visible Value: ${wantedVisibleValue.toFixed(2)}</div>
        <div style={{ color: "#94a3b8", fontSize: "13px" }}>
          Cards are hidden by default to avoid spoilers. Use the reveal button when you are ready.
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search missing cards"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            minWidth: "280px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        />

        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5edf7",
          }}
        >
          <option value="all">All Sets</option>
          {setOptions.map((setCode) => (
            <option key={setCode} value={setCode}>
              {setCode}
            </option>
          ))}
        </select>

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
          <option value="value_desc">Value High-Low</option>
          <option value="value_asc">Value Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="set_number">Set / Number</option>
        </select>

        <button
          type="button"
          onClick={() => setShowCards((value) => !value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #475569",
            background: showCards ? "#2a0f14" : "#1e293b",
            color: showCards ? "#fecaca" : "#e5edf7",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {showCards ? "Hide Cards" : "Reveal Missing Cards"}
        </button>
      </div>

      {!showCards ? (
        <div
          style={{
            border: "1px dashed #334155",
            borderRadius: "18px",
            padding: "24px",
            background: "linear-gradient(180deg, #172033, #111827)",
            color: "#cbd5e1",
          }}
        >
          Missing cards are currently hidden. Your filters and summary still work without revealing card names or images.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "14px",
          }}
        >
          {filtered.map((card) => {
            const aspectPills = getAspectPills(card?.aspect);
            const displayName = getCardDisplayName(card);

            return (
              <div
                key={card.id}
                style={{
                  border: wantedSet.has(card.id) ? "1px solid #facc15" : "1px solid #334155",
                  borderRadius: "14px",
                  padding: "10px",
                  minHeight: "170px",
                  background: "#0f172a",
                  display: "flex",
                  gap: "10px",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <CardImage src={card?.front_art} name={displayName} />

                <div style={{ flex: 1, minWidth: 0, paddingBottom: "42px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#e5edf7",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </div>

                  <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "5px" }}>
                    {card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                    {aspectPills.map((pill) => (
                      <div
                        key={pill.name}
                        style={{
                          fontSize: "9px",
                          lineHeight: 1,
                          padding: "3px 5px",
                          borderRadius: "999px",
                          background: `${pill.color}22`,
                          border: `1px solid ${pill.color}`,
                          color: pill.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pill.name}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "6px" }}>
                    Type: {card?.card_type || "-"}{card?.arena ? ` • ${card.arena}` : ""}
                  </div>

                  <div style={{ fontSize: "11px", color: "#86efac", fontWeight: 700, marginTop: "6px" }}>
                    ${Number(card?.price || 0).toFixed(2)}
                  </div>
                </div>

                <div style={{ position: "absolute", right: "10px", bottom: "8px" }}>
                  <WishlistButton cardId={card.id} initialWanted={wantedSet.has(card.id)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
