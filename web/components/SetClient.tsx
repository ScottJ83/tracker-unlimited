"use client";

import { useMemo, useState } from "react";
import AddCardButton from "./AddCardButton";

type Card = {
  id: string;
  name?: string | null;
  subtitle?: string | null;
  set_code?: string | null;
  card_number?: string | number | null;
  variant?: string | null;
  aspect?: string | null;
  traits?: string | null;
  rarity?: string | null;
  artist?: string | null;
  cost?: string | number | null;
  power?: string | number | null;
  hp?: string | number | null;
  front_text?: string | null;
  front_art?: string | null;
  price?: string | number | null;
};

type CollectionEntry = {
  card_id: string;
  quantity: number;
};

function getAspectPills(aspect: string | null | undefined) {
  const text = String(aspect || "").toLowerCase();
  const pills: { name: string; tone: string }[] = [];

  if (text.includes("vigilance")) pills.push({ name: "Vigilance", tone: "vigilance" });
  if (text.includes("command")) pills.push({ name: "Command", tone: "command" });
  if (text.includes("aggression")) pills.push({ name: "Aggression", tone: "aggression" });
  if (text.includes("cunning")) pills.push({ name: "Cunning", tone: "cunning" });
  if (text.includes("heroism")) pills.push({ name: "Heroism", tone: "heroism" });
  if (text.includes("villainy")) pills.push({ name: "Villainy", tone: "villainy" });

  return pills;
}

function InfoChip({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="swu-info-chip">
      <span className="swu-info-chip-label">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ArtThumb({ frontArt, name }: { frontArt?: string | null; name: string }) {
  if (!frontArt) {
    return (
      <div className="swu-art-thumb swu-art-thumb--empty">
        <span>No Art</span>
      </div>
    );
  }

  return (
    <div className="swu-art-preview">
      <img src={frontArt} alt={name} className="swu-art-thumb" />
      <div className="swu-art-popover">
        <img src={frontArt} alt={name} className="swu-art-popover-image" />
      </div>
    </div>
  );
}

export default function SetClient({
  cards,
  collection,
}: {
  cards: Card[];
  collection: CollectionEntry[];
}) {
  const [showMissing, setShowMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [sortBy, setSortBy] = useState("number_asc");

  function getQty(cardId: string) {
    const entry = collection?.find((c) => c.card_id === cardId && c.quantity > 0);
    return entry ? Number(entry.quantity || 0) : 0;
  }

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = textSearch.trim().toLowerCase();

    const rows = (cards || []).filter((card) => {
      const qty = getQty(card.id);
      const owned = qty > 0;

      if (!showMissing && !owned) return false;

      const name = String(card.name || "").toLowerCase();
      const subtitle = String(card.subtitle || "").toLowerCase();
      const setCode = String(card.set_code || "").toLowerCase();
      const number = String(card.card_number || "").toLowerCase();
      const variant = String(card.variant || "").toLowerCase();
      const aspect = String(card.aspect || "").toLowerCase();
      const traits = String(card.traits || "").toLowerCase();

      const frontText = String(card.front_text || "").toLowerCase();
      const rarity = String(card.rarity || "").toLowerCase();
      const artist = String(card.artist || "").toLowerCase();
      const cost = String(card.cost ?? "").toLowerCase();
      const power = String(card.power ?? "").toLowerCase();
      const hp = String(card.hp ?? "").toLowerCase();

      const mainMatch =
        !q ||
        name.includes(q) ||
        subtitle.includes(q) ||
        setCode.includes(q) ||
        number.includes(q) ||
        variant.includes(q) ||
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

    rows.sort((a, b) => {
      const aQty = getQty(a.id);
      const bQty = getQty(b.id);

      if (sortBy === "name_asc") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "name_desc") {
        return String(b.name || "").localeCompare(String(a.name || ""));
      }

      if (sortBy === "price_desc") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "price_asc") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "owned_desc") {
        return bQty - aQty;
      }

      const aNum = Number(a.card_number || 0);
      const bNum = Number(b.card_number || 0);
      return aNum - bNum;
    });

    return rows;
  }, [cards, collection, search, textSearch, showMissing, sortBy]);

  return (
    <div className="swu-stack-16">
      <section className="swu-toolbar-panel">
        <div className="swu-toolbar-grid">
          <input
            type="text"
            placeholder="Search name, number, variant, aspect, set, or traits"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="swu-input"
          />

          <input
            type="text"
            placeholder="Search text, rarity, artist, cost, power, or hp"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            className="swu-input"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="swu-select"
          >
            <option value="number_asc">Card Number</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="price_desc">Price High–Low</option>
            <option value="price_asc">Price Low–High</option>
            <option value="owned_desc">Most Owned</option>
          </select>

          <label className="swu-toggle">
            <input
              type="checkbox"
              checked={showMissing}
              onChange={(e) => setShowMissing(e.target.checked)}
            />
            <span>Show Missing</span>
          </label>
        </div>
      </section>

      <div className="swu-card-list">
        {filteredCards.map((card) => {
          const qty = getQty(card.id);
          const owned = qty > 0;
          const aspectPills = getAspectPills(card.aspect);
          const unitPrice = Number(card.price || 0);

          return (
            <article
              key={card.id}
              className={`swu-card-row ${owned ? "is-owned" : "is-missing"}`}
            >
              <div className="swu-card-row-art">
                <ArtThumb frontArt={card.front_art} name={card.name || "Card"} />
              </div>

              <div className="swu-card-row-main">
                <div className="swu-card-row-top">
                  <div className="swu-card-title-wrap">
                    <div className="swu-card-title-line">
                      <h3 className="swu-card-title">{card.name || "Unknown Card"}</h3>
                      <span className="swu-card-number">
                        #{card.card_number ?? "-"}
                      </span>
                    </div>

                    {card.subtitle ? (
                      <div className="swu-card-subtitle">{card.subtitle}</div>
                    ) : null}
                  </div>

                  <div className="swu-card-meta-right">
                    <div className={`swu-qty-badge ${owned ? "is-owned" : "is-missing"}`}>
                      Qty {qty}
                    </div>
                    <div className="swu-price-badge">${unitPrice.toFixed(2)}</div>
                  </div>
                </div>

                <div className="swu-aspect-row">
                  {aspectPills.length > 0 ? (
                    aspectPills.map((pill) => (
                      <span
                        key={pill.name}
                        className={`swu-aspect-pill swu-aspect-pill--${pill.tone}`}
                      >
                        {pill.name}
                      </span>
                    ))
                  ) : (
                    <span className="swu-aspect-pill swu-aspect-pill--neutral">
                      No Aspect
                    </span>
                  )}
                </div>

                {owned ? (
                  <>
                    <div className="swu-info-chip-row">
                      <InfoChip label="Set" value={card.set_code} />
                      <InfoChip label="Variant" value={card.variant} />
                      <InfoChip label="Rarity" value={card.rarity} />
                      <InfoChip label="Cost" value={card.cost} />
                      <InfoChip label="Power" value={card.power} />
                      <InfoChip label="HP" value={card.hp} />
                    </div>

                    <div className="swu-card-detail-grid">
                      <div className="swu-card-detail-block">
                        <div className="swu-card-detail-label">Traits</div>
                        <div className="swu-card-detail-value">{card.traits || "—"}</div>
                      </div>

                      <div className="swu-card-detail-block">
                        <div className="swu-card-detail-label">Artist</div>
                        <div className="swu-card-detail-value">{card.artist || "—"}</div>
                      </div>
                    </div>

                    <div className="swu-card-text-box">
                      {card.front_text || "No card text available."}
                    </div>
                  </>
                ) : (
                  <div className="swu-card-hidden-note">
                    Details hidden until this card is in your collection. Showing only
                    essentials for missing cards.
                    <div className="swu-info-chip-row" style={{ marginTop: 12 }}>
                      <InfoChip label="Set" value={card.set_code} />
                      <InfoChip label="Variant" value={card.variant} />
                    </div>
                  </div>
                )}
              </div>

              <div className="swu-card-row-side">
                <AddCardButton cardId={card.id} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}