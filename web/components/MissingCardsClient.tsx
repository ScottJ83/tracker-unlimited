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

function CardImage({ src, name, hidden }: { src?: string | null; name: string; hidden: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="tu-card-image-wrap"
      onMouseEnter={() => {
        if (!hidden && src) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      {!hidden && src ? (
        <>
          <img src={src} alt={name} className="tu-card-image" />
          {hover ? <img src={src} alt={name} className="tu-card-image-preview" /> : null}
        </>
      ) : (
        <div className="tu-spoiler-card">?</div>
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

  const totalMissingValue = filtered.reduce((sum, card) => sum + Number(card?.price || 0), 0);
  const wantedVisible = filtered.filter((card) => wantedSet.has(card.id)).length;

  return (
    <div>
      <section className="tu-summary-panel">
        <div className="tu-summary-title">Uncollected Summary</div>
        <div className="tu-summary-grid">
          <div className="tu-stat-card">
            <div className="tu-stat-label">Visible Uncollected Cards</div>
            <strong>{filtered.length}</strong>
          </div>
          <div className="tu-stat-card">
            <div className="tu-stat-label">Visible Uncollected Value</div>
            <strong>${totalMissingValue.toFixed(2)}</strong>
          </div>
          <div className="tu-stat-card">
            <div className="tu-stat-label">Wanted From Visible</div>
            <strong>{wantedVisible}</strong>
          </div>
          <div className="tu-stat-card">
            <div className="tu-stat-label">Spoiler Mode</div>
            <strong>{showCards ? "Shown" : "Hidden"}</strong>
          </div>
        </div>
      </section>

      <section className="tu-filter-panel">
        <input
          type="text"
          placeholder="Search uncollected cards"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={setFilter} onChange={(e) => setSetFilter(e.target.value)}>
          <option value="all">All Sets</option>
          {setOptions.map((setCode) => (
            <option key={setCode} value={setCode}>
              {setCode}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="value_desc">Value High-Low</option>
          <option value="value_asc">Value Low-High</option>
          <option value="name_asc">Name A-Z</option>
          <option value="set_number">Set / Number</option>
        </select>

        <button type="button" className="tu-gold-button" onClick={() => setShowCards((value) => !value)}>
          {showCards ? "Hide Card Details" : "Show Card Details"}
        </button>
      </section>

      {!showCards ? (
        <section className="tu-spoiler-panel">
          <div className="tu-summary-title">Spoiler Safe Mode</div>
          <p>
            Uncollected card details are hidden by default. Use filters to narrow the list, then reveal card details when you are ready.
          </p>
          <button type="button" className="tu-gold-button" onClick={() => setShowCards(true)}>
            Show Uncollected Cards
          </button>
        </section>
      ) : null}

      <div className="tu-card-grid">
        {filtered.map((card) => {
          const aspectPills = getAspectPills(card?.aspect);
          const displayName = getCardDisplayName(card);
          const hidden = !showCards;

          return (
            <div key={card.id} className="tu-card-tile tu-card-tile--uncollected">
              <CardImage src={card?.front_art} name={displayName} hidden={hidden} />

              <div className="tu-card-body">
                {hidden ? (
                  <>
                    <div className="tu-card-title">Uncollected Card</div>
                    <div className="tu-card-meta">{card?.set_code || "-"} #{card?.card_number ?? "-"}</div>
                    <div className="tu-card-meta">Variant: {card?.variant || "-"}</div>
                    <div className="tu-card-text">Details hidden to avoid spoilers.</div>
                  </>
                ) : (
                  <>
                    <div className="tu-card-title">{displayName}</div>
                    <div className="tu-card-meta">
                      {card?.set_code || "-"} #{card?.card_number ?? "-"} • {card?.variant || "-"}
                    </div>
                    <div className="tu-pill-row">
                      {aspectPills.map((pill) => (
                        <span key={pill.name} className="tu-aspect-pill" style={{ borderColor: pill.color, color: pill.color }}>
                          {pill.name}
                        </span>
                      ))}
                    </div>
                    <div className="tu-card-meta">
                      Type: {card?.card_type || "-"}{card?.arena ? ` • ${card.arena}` : ""}
                    </div>
                    <div className="tu-card-price">${Number(card?.price || 0).toFixed(2)}</div>
                  </>
                )}
              </div>

              <div className="tu-card-actions">
                <WishlistButton cardId={card.id} initialWanted={wantedSet.has(card.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
