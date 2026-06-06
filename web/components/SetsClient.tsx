"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";

const setColors: Record<string, string> = {
  LAW: "#c87a2c",
  LAWOP: "#c87a2c",
  SEC: "#5b3aa6",
  SECOP: "#5b3aa6",
  JTL: "#f2c200",
  JTLOP: "#f2c200",
  SOR: "#d32f2f",
  SOROP: "#d32f2f",
  LOF: "#2f6fd3",
  LOFOP: "#2f6fd3",
  SHD: "#3949ab",
  SHDOP: "#3949ab",
  TWI: "#8b1e2d",
  TWIOP: "#8b1e2d",
  IBH: "#e5e7eb",
  ASH: "#b45309",
  TS26: "#00bcd4",
  C24: "#64748b",
  C25: "#64748b",
  G25: "#64748b",
  GG: "#64748b",
  J24: "#64748b",
  J25: "#64748b",
  P25: "#64748b",
  P26: "#64748b",
  SS1: "#0ea5e9",
  SS1J: "#0ea5e9",
  SS2: "#0ea5e9",
  ESOR: "#d32f2f",
  TSOR: "#d32f2f",
  PSOR: "#d32f2f",
  PSHD: "#3949ab",
  PTWI: "#8b1e2d",
};

const preferredOrder = [
  "LAW",
  "SEC",
  "JTL",
  "SOR",
  "LOF",
  "SHD",
  "TWI",
  "IBH",
  "ASH",
  "LAWOP",
  "SECOP",
  "JTLOP",
  "SOROP",
  "LOFOP",
  "SHDOP",
  "TWIOP",
  "TS26",
  "C24",
  "C25",
  "G25",
  "GG",
  "J24",
  "J25",
  "P25",
  "P26",
  "SS1",
  "SS1J",
  "SS2",
  "ESOR",
  "TSOR",
  "PSOR",
  "PSHD",
  "PTWI",
];

function getBaseKey(card: any) {
  return `${String(card?.name || "").trim()}|${String(card?.subtitle || "").trim()}`;
}

function getSetType(code: string) {
  const normalized = String(code || "").toUpperCase();

  if (normalized.endsWith("OP")) return "op";

  if (
    normalized.startsWith("P") ||
    normalized.startsWith("J") ||
    normalized.startsWith("C") ||
    normalized.startsWith("G") ||
    normalized.startsWith("SS") ||
    normalized.startsWith("T") ||
    normalized.startsWith("E")
  ) {
    return "special";
  }

  return "main";
}

function getSetTypeLabel(code: string) {
  const type = getSetType(code);

  if (type === "op") return "Organized Play";
  if (type === "special") return "Special";
  return "Main Set";
}

function normalizeJoinedId(value: any) {
  return String(value || "");
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: "14px",
        padding: "12px",
        background: "#0f172a",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ color: "#e5edf7", fontWeight: 800, fontSize: "18px" }}>
        {value}
      </div>
    </div>
  );
}

export default function SetsClient({
  sets,
  cards,
  collection,
}: {
  sets: any[];
  cards: any[];
  collection: any[];
}) {
  const [setFilter, setSetFilter] = useState("all");
  const [sortBy, setSortBy] = useState("base_desc");
  const [search, setSearch] = useState("");

  const ownedCardIds = useMemo(() => {
    return new Set(
      (collection || [])
        .filter((item: any) => Number(item.quantity || 0) > 0)
        .map((item: any) => normalizeJoinedId(item.card_id))
    );
  }, [collection]);

  const setSummaries = useMemo(() => {
    return (sets || []).map((set: any) => {
      const setCode = String(set.code || "").trim().toUpperCase();

      const setCards = (cards || []).filter(
        (card: any) =>
          String(card.set_code || "").trim().toUpperCase() === setCode
      );

      const allBaseKeys = new Set(setCards.map((card: any) => getBaseKey(card)));

      const cardIdToBaseKey = new Map(
        setCards.map((card: any) => [normalizeJoinedId(card.id), getBaseKey(card)])
      );

      const ownedBaseKeys = new Set(
        (collection || [])
          .filter((item: any) => Number(item.quantity || 0) > 0)
          .map((item: any) => cardIdToBaseKey.get(normalizeJoinedId(item.card_id)))
          .filter(Boolean)
      );

      const baseTotal = allBaseKeys.size;
      const baseOwned = ownedBaseKeys.size;
      const basePercent = baseTotal > 0 ? (baseOwned / baseTotal) * 100 : 0;

      const fullTotal = setCards.length;
      const fullOwned = setCards.filter((card: any) =>
        ownedCardIds.has(normalizeJoinedId(card.id))
      ).length;
      const fullPercent = fullTotal > 0 ? (fullOwned / fullTotal) * 100 : 0;

      const setValue = setCards.reduce((sum: number, card: any) => {
        const entry = (collection || []).find(
          (item: any) => normalizeJoinedId(item.card_id) === normalizeJoinedId(card.id)
        );
        const qty = Number(entry?.quantity || 0);
        return sum + qty * Number(card.price || 0);
      }, 0);

      return {
        ...set,
        code: setCode,
        type: getSetType(setCode),
        typeLabel: getSetTypeLabel(setCode),
        baseTotal,
        baseOwned,
        basePercent,
        fullTotal,
        fullOwned,
        fullPercent,
        missingBase: Math.max(baseTotal - baseOwned, 0),
        setValue,
      };
    });
  }, [sets, cards, collection, ownedCardIds]);

  const visibleSets = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = setSummaries.filter((set: any) => {
      const matchesFilter = setFilter === "all" || set.type === setFilter;

      const matchesSearch =
        !q ||
        String(set.code || "").toLowerCase().includes(q) ||
        String(set.name || "").toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });

    rows.sort((a: any, b: any) => {
      if (sortBy === "base_desc") {
        if (b.baseTotal !== a.baseTotal) return b.baseTotal - a.baseTotal;
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "base_asc") {
        if (a.baseTotal !== b.baseTotal) return a.baseTotal - b.baseTotal;
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "progress_desc") {
        if (b.basePercent !== a.basePercent) return b.basePercent - a.basePercent;
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "value_desc") {
        if (b.setValue !== a.setValue) return b.setValue - a.setValue;
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "name_asc") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      const aIndex = preferredOrder.indexOf(a.code);
      const bIndex = preferredOrder.indexOf(b.code);

      if (aIndex !== bIndex) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    return rows;
  }, [setSummaries, setFilter, search, sortBy]);

  const totalBase = visibleSets.reduce((sum: number, set: any) => sum + set.baseTotal, 0);
  const totalOwnedBase = visibleSets.reduce((sum: number, set: any) => sum + set.baseOwned, 0);
  const totalFull = visibleSets.reduce((sum: number, set: any) => sum + set.fullTotal, 0);
  const totalOwnedFull = visibleSets.reduce((sum: number, set: any) => sum + set.fullOwned, 0);
  const totalValue = visibleSets.reduce((sum: number, set: any) => sum + set.setValue, 0);

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Sets</h1>
          <div style={{ color: "#94a3b8", marginTop: "6px" }}>
            Sort sets by base size, progress, value, or preferred order.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <SummaryStat label="Shown Sets" value={visibleSets.length} />
        <SummaryStat label="Base Progress" value={`${totalOwnedBase} / ${totalBase}`} />
        <SummaryStat label="Full Progress" value={`${totalOwnedFull} / ${totalFull}`} />
        <SummaryStat label="Shown Value" value={`$${totalValue.toFixed(2)}`} />
      </div>

      <div
        style={{
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "14px",
          background: "linear-gradient(180deg, #172033, #111827)",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <input
          type="text"
          placeholder="Search sets"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            minWidth: "220px",
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
          <option value="main">Main Sets</option>
          <option value="op">Organized Play</option>
          <option value="special">Special / Promo</option>
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
          <option value="base_desc">Base Cards High-Low</option>
          <option value="base_asc">Base Cards Low-High</option>
          <option value="progress_desc">Base Progress High-Low</option>
          <option value="value_desc">Owned Value High-Low</option>
          <option value="name_asc">Name A-Z</option>
          <option value="custom">Preferred Order</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {visibleSets.map((set: any) => {
          const color = setColors[set.code] || "#475569";

          return (
            <Link
              key={set.code}
              href={`/sets/${set.code}`}
              style={{
                border: "1px solid #334155",
                borderRadius: "18px",
                padding: "18px",
                background: "linear-gradient(180deg, #172033, #111827)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                borderTop: `4px solid ${color}`,
                minHeight: "230px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div style={{ color: "#7dd3fc", fontSize: "13px" }}>
                  {set.code}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    padding: "3px 7px",
                    borderRadius: "999px",
                    background: `${color}22`,
                    border: `1px solid ${color}`,
                    color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {set.typeLabel}
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "14px" }}>
                {set.name}
              </div>

              <ProgressBar label="Base" value={set.basePercent} />
              <ProgressBar label="Full" value={set.fullPercent} />

              <div style={{ fontSize: "14px", color: "#cbd5e1", marginTop: "10px" }}>
                <div>Base: {set.baseOwned} / {set.baseTotal}</div>
                <div>Full: {set.fullOwned} / {set.fullTotal}</div>
                <div>Missing Base: {set.missingBase}</div>
                <div>Owned Value: ${set.setValue.toFixed(2)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
