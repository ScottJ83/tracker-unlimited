"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";

type Pill = { name: string; color: string };

function getAspectPills(aspect: string | null | undefined): Pill[] {
  const text = String(aspect || "").toLowerCase();
  const pills: Pill[] = [];

  if (text.includes("vigilance")) pills.push({ name: "Vigilance", color: "#3b82f6" });
  if (text.includes("command")) pills.push({ name: "Command", color: "#16a34a" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", color: "#dc2626" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", color: "#d97706" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", color: "#d4d4aa" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", color: "#7c3aed" });

  return pills;
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color: string;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <span
      className="tu-aspect-pill"
      style={{
        color,
        borderColor: color,
      }}
    >
      {label}: {value}
    </span>
  );
}

function CardImage({ src, name }: { src?: string | null; name: string }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="tu-card-image-wrap"
      onMouseEnter={() => {
        if (src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {src ? (
        <>
          <img src={src} alt={name} className="tu-card-image" />
          {hover ? <img src={src} alt={name} className="tu-card-image-preview" /> : null}
        </>
      ) : (
        <div className="tu-spoiler-card">—</div>
      )}
    </div>
  );
}

function normalizeCard(item: any) {
  return Array.isArray(item?.cards) ? item.cards[0] : item?.cards;
}

function displayName(card: any) {
  if (!card) return "Unknown card";
  return card?.subtitle ? `${card.name}: ${card.subtitle}` : card?.name || "Unknown card";
}

function CompactValueRow({
  quantity,
  unitValue,
  totalValue,
}: {
  quantity: number;
  unitValue: number;
  totalValue: number;
}) {
  const itemStyle = {
    fontSize: "11px",
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "#cfd7e4",
    whiteSpace: "nowrap" as const,
  };

  const labelStyle = {
    color: "var(--accent)",
    fontWeight: 900,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
        marginTop: "8px",
        paddingRight: "82px",
        flexWrap: "wrap",
      }}
    >
      <span style={itemStyle}>
        <strong style={labelStyle}>Qty:</strong> {quantity}
      </span>
      <span style={itemStyle}>
        <strong style={labelStyle}>Unit:</strong> ${unitValue.toFixed(2)}
      </span>
      <span style={itemStyle}>
        <strong style={labelStyle}>Total:</strong> ${totalValue.toFixed(2)}
      </span>
    </div>
  );
}

export default function CollectionClient({ data }: any) {
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    const rows = (data || []).filter((item: any) => {
      const card = normalizeCard(item);

      const haystack = [
        card?.name,
        card?.subtitle,
        card?.set_code,
        card?.card_number,
        card?.aspect,
        card?.traits,
        card?.variant,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const textHaystack = [
        card?.front_text,
        card?.rarity,
        card?.artist,
        card?.cost,
        card?.power,
        card?.hp,
        card?.card_type,
        card?.arena,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return (!q || haystack.includes(q)) && (!tq || textHaystack.includes(tq));
    });

    rows.sort((a: any, b: any) => {
      const ac = normalizeCard(a);
      const bc = normalizeCard(b);
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
      <section className="tu-filter-bar">
        <input
          type="text"
          placeholder="Search name, set, number, aspect, or traits"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ minWidth: "320px", padding: "10px 12px" }}
        />

        <input
          type="text"
          placeholder="Search text, rarity, artist, cost, power, or hp"
          value={textSearch}
          onChange={(event) => setTextSearch(event.target.value)}
          style={{ minWidth: "320px", padding: "10px 12px" }}
        />

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          style={{ padding: "10px 12px" }}
        >
          <option value="price_desc">Price High-Low</option>
          <option value="price_asc">Price Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </section>

      <div className="tu-card-grid">
        {filtered.map((item: any) => {
          const card = normalizeCard(item);
          const aspectPills = getAspectPills(card?.aspect);
          const unitValue = Number(card?.price || 0);
          const quantity = Number(item.quantity || 0);
          const totalValue = unitValue * quantity;

          return (
            <div key={item.id} className="tu-card-tile">
              <CardImage src={card?.front_art} name={displayName(card)} />

              <div className="tu-card-body">
                <div className="tu-card-title">{displayName(card)}</div>

                <div className="tu-card-meta">
                  {card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}
                </div>

                <div className="tu-pill-row">
                  <StatPill label="Cost" value={card?.cost} color="#f5c542" />
                  <StatPill label="Power" value={card?.power} color="#ef4444" />
                  <StatPill label="HP" value={card?.hp} color="#3b82f6" />
                  {aspectPills.map((pill) => (
                    <span
                      key={pill.name}
                      className="tu-aspect-pill"
                      style={{
                        color: pill.color,
                        borderColor: pill.color,
                      }}
                    >
                      {pill.name}
                    </span>
                  ))}
                </div>

                <div className="tu-card-meta">Traits: {card?.traits || "-"}</div>
                <div className="tu-card-text">{card?.front_text || "-"}</div>

                <CompactValueRow
                  quantity={quantity}
                  unitValue={unitValue}
                  totalValue={totalValue}
                />
              </div>

              <div className="tu-card-actions">
                <AddCardButton cardId={item.card_id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
