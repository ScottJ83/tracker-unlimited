"use client";

import { useMemo, useState } from "react";
import WishlistButton from "./WishlistButton";

function getCardDisplayName(card: any) {
  return card?.subtitle ? `${card.name}: ${card.subtitle}` : card?.name || "Unknown card";
}

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

function CardImage({ src, name, hidden }: { src?: string | null; name: string; hidden: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="tu-card-image-wrap-polished"
      onMouseEnter={() => {
        if (!hidden && src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {!hidden && src ? (
        <>
          <img src={src} alt={name} className="tu-card-image-polished" />
          {hover ? <img src={src} alt={name} className="tu-card-image-preview-polished" /> : null}
        </>
      ) : (
        <div className="tu-spoiler-question">?</div>
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

    const rows = (cards || []).filter((card) => {
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

  const totalUncollectedValue = filtered.reduce((sum, card) => sum + Number(card?.price || 0), 0);
  const wantedVisible = filtered.filter((card) => wantedSet.has(card.id)).length;

  return (
    <div>
      <section className="sw-shell" style={{ padding: "18px", marginBottom: "18px" }}>
        <div className="tu-summary-title-row">
          <div className="tu-summary-title" style={{ marginBottom: 0 }}>Uncollected Summary</div>
          <button type="button" className="sw-button" onClick={() => setShowCards((value) => !value)}>
            {showCards ? "Hide Details" : "Show Details"}
          </button>
        </div>

        <div className="tu-summary-grid" style={{ marginTop: "14px" }}>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Visible Cards</div>
            <strong>{filtered.length}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Visible Value</div>
            <strong>${totalUncollectedValue.toFixed(2)}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Wanted Visible</div>
            <strong>{wantedVisible}</strong>
          </div>
          <div className="sw-stat-card">
            <div className="sw-muted" style={{ fontSize: 12 }}>Spoiler Mode</div>
            <strong>{showCards ? "Shown" : "Hidden"}</strong>
          </div>
        </div>
      </section>

      <section className="sw-panel" style={{ padding: "14px", marginBottom: "18px" }}>
        <div className="tu-filter-bar" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Search uncollected cards"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: "280px", padding: "10px 12px" }}
          />

          <select value={setFilter} onChange={(event) => setSetFilter(event.target.value)} style={{ padding: "10px 12px" }}>
            <option value="all">All Sets</option>
            {setOptions.map((setCode) => (
              <option key={setCode} value={setCode}>
                {setCode}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ padding: "10px 12px" }}>
            <option value="value_desc">Value High-Low</option>
            <option value="value_asc">Value Low-High</option>
            <option value="name_asc">Name A-Z</option>
            <option value="set_number">Set / Number</option>
          </select>
        </div>
      </section>

      {!showCards ? (
        <section className="sw-shell" style={{ padding: "22px", marginBottom: "18px" }}>
          <div className="sw-kicker">Spoiler Safe Mode</div>
          <p className="sw-page-subtitle" style={{ maxWidth: "760px" }}>
            Uncollected card details are hidden by default. Use the filters to narrow the list, then reveal details when you are ready.
          </p>
<button
  onClick={() => setShowDetails(!showDetails)}
>
  {showDetails
    ? "Hide Uncollected Cards"
    : "Show Uncollected Cards"}
</button>
        </section>
      ) : null}

      <div className="tu-card-grid-polished">
        {filtered.map((card) => {
          const aspectPills = getAspectPills(card?.aspect);
          const displayName = getCardDisplayName(card);
          const hidden = !showCards;

          return (
            <div key={card.id} className="tu-card-tile-polished">
              <CardImage src={card?.front_art} name={displayName} hidden={hidden} />

              <div className="tu-card-body-polished">
                {hidden ? (
                  <>
                    <div className="tu-card-title-polished">Uncollected Card</div>
                    <div className="tu-card-meta-polished">{card?.set_code || "-"} #{card?.card_number ?? "-"}</div>
                    <div className="tu-card-meta-polished">Variant: {card?.variant || "-"}</div>
                    <div className="tu-card-text-polished">Details hidden to avoid spoilers.</div>
                  </>
                ) : (
                  <>
                    <div className="tu-card-title-polished">{displayName}</div>
                    <div className="tu-card-subtitle-polished">{card?.subtitle || ""}</div>
                    <div className="tu-card-chip-row-polished">
                      {aspectPills.map((pill) => (
                        <span key={pill.name} className="tu-card-chip-polished" style={{ color: pill.color, borderColor: pill.color }}>
                          {pill.name}
                        </span>
                      ))}
                    </div>
                    <div className="tu-card-meta-polished">{card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}</div>
                    <div className="tu-card-meta-polished">Type: {card?.card_type || "-"}{card?.arena ? ` • ${card.arena}` : ""}</div>
                    <div className="tu-card-meta-polished">Traits: {card?.traits || "-"}</div>
                    <div className="tu-card-value-row-polished">
                      <span><strong>Value:</strong> ${Number(card?.price || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="tu-card-actions-polished">
                <WishlistButton cardId={card.id} initialWanted={wantedSet.has(card.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
