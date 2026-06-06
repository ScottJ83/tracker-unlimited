"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProgressBar from "@/components/ProgressBar";

const mainSets = new Set(["SOR", "SHD", "TWI", "JTL", "LOF", "SEC", "LAW", "ASH", "IBH"]);

const setColors: Record<string, string> = {
  LAW: "#d48635",
  LAWOP: "#d48635",
  SEC: "#7a4dd8",
  SECOP: "#7a4dd8",
  JTL: "#f5c542",
  JTLOP: "#f5c542",
  SOR: "#e5484d",
  SOROP: "#e5484d",
  LOF: "#4386ff",
  LOFOP: "#4386ff",
  SHD: "#4f67dc",
  SHDOP: "#4f67dc",
  TWI: "#b32638",
  TWIOP: "#b32638",
  ASH: "#d48635",
  IBH: "#e5e7eb",
};

function getSetType(code: string) {
  const upper = String(code || "").toUpperCase();
  if (mainSets.has(upper)) return "main";
  if (upper.endsWith("OP")) return "op";
  return "special";
}

function labelForType(type: string) {
  if (type === "main") return "Main Set";
  if (type === "op") return "Organized Play";
  return "Special";
}

function percent(owned: number, total: number) {
  return total > 0 ? (owned / total) * 100 : 0;
}

export default function SetsClient({ sets = [] }: { sets: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("base_desc");

  const visibleSets = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...sets]
      .filter((set: any) => {
        const type = getSetType(set.code);
        const searchMatch = !q || String(set.code || "").toLowerCase().includes(q) || String(set.name || "").toLowerCase().includes(q);
        const filterMatch = filter === "all" || type === filter;
        return searchMatch && filterMatch;
      })
      .sort((a: any, b: any) => {
        if (sort === "base_asc") return Number(a.baseTotal || 0) - Number(b.baseTotal || 0);
        if (sort === "progress_desc") return percent(Number(b.baseOwned || 0), Number(b.baseTotal || 0)) - percent(Number(a.baseOwned || 0), Number(a.baseTotal || 0));
        if (sort === "value_desc") return Number(b.ownedValue || 0) - Number(a.ownedValue || 0);
        if (sort === "name_asc") return String(a.name || "").localeCompare(String(b.name || ""));
        return Number(b.baseTotal || 0) - Number(a.baseTotal || 0);
      });
  }, [sets, search, filter, sort]);

  const totals = visibleSets.reduce(
    (acc: any, set: any) => {
      acc.baseOwned += Number(set.baseOwned || 0);
      acc.baseTotal += Number(set.baseTotal || 0);
      acc.fullOwned += Number(set.fullOwned || 0);
      acc.fullTotal += Number(set.fullTotal || 0);
      acc.value += Number(set.ownedValue || 0);
      return acc;
    },
    { baseOwned: 0, baseTotal: 0, fullOwned: 0, fullTotal: 0, value: 0 }
  );

  return (
    <div>
      <div className="sw-panel" style={{ marginBottom: "20px", padding: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          <div className="sw-stat-card"><div style={{ color: "#aeb8c7", fontSize: 12 }}>Shown Sets</div><strong>{visibleSets.length}</strong></div>
          <div className="sw-stat-card"><div style={{ color: "#aeb8c7", fontSize: 12 }}>Base Progress</div><strong>{totals.baseOwned} / {totals.baseTotal}</strong></div>
          <div className="sw-stat-card"><div style={{ color: "#aeb8c7", fontSize: 12 }}>Full Progress</div><strong>{totals.fullOwned} / {totals.fullTotal}</strong></div>
          <div className="sw-stat-card"><div style={{ color: "#aeb8c7", fontSize: 12 }}>Shown Value</div><strong>${totals.value.toFixed(2)}</strong></div>
        </div>
      </div>

      <div className="sw-panel" style={{ marginBottom: "24px", padding: "14px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sets" style={{ minWidth: 220, padding: "10px 12px" }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "10px 12px" }}>
          <option value="all">All Sets</option>
          <option value="main">Main Sets</option>
          <option value="op">Organized Play</option>
          <option value="special">Special Sets</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "10px 12px" }}>
          <option value="base_desc">Base Cards High-Low</option>
          <option value="base_asc">Base Cards Low-High</option>
          <option value="progress_desc">Base Progress High-Low</option>
          <option value="value_desc">Owned Value High-Low</option>
          <option value="name_asc">Name A-Z</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "18px" }}>
        {visibleSets.map((set: any) => {
          const type = getSetType(set.code);
          const color = setColors[String(set.code).toUpperCase()] || "#f5c542";
          const basePercent = percent(Number(set.baseOwned || 0), Number(set.baseTotal || 0));
          const fullPercent = percent(Number(set.fullOwned || 0), Number(set.fullTotal || 0));

          return (
            <Link
              key={set.code}
              href={`/sets/${set.code}`}
              className="sw-card"
              style={{
                minHeight: 260,
                borderTop: `3px solid ${color}`,
                display: "grid",
                alignContent: "start",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div style={{ color: color, fontWeight: 900, fontSize: 12, letterSpacing: "0.12em" }}>{set.code}</div>
                <div style={{ color, border: `1px solid ${color}`, borderRadius: 999, padding: "2px 7px", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  {labelForType(type)}
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{set.name}</div>

              <ProgressBar label="Base" value={basePercent} />
              <ProgressBar label="Full" value={fullPercent} />

              <div style={{ color: "#e5edf7", fontWeight: 800, fontSize: 13, lineHeight: 1.35, letterSpacing: "0.06em" }}>
                <div>Base: {set.baseOwned || 0} / {set.baseTotal || 0}</div>
                <div>Full: {set.fullOwned || 0} / {set.fullTotal || 0}</div>
                <div>Missing Base: {Math.max(0, Number(set.baseTotal || 0) - Number(set.baseOwned || 0))}</div>
                <div>Owned Value: ${Number(set.ownedValue || 0).toFixed(2)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
