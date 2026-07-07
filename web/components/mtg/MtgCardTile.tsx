"use client";

import { useState } from "react";
import MtgQuantityControls from "./MtgQuantityControls";
import { usd } from "@/lib/mtg/format";

type Props = {
  card: any;
  muted?: boolean;
  hidden?: boolean;
  showControls?: boolean;
  compactControls?: boolean;
};

function cardName(card: any) {
  return card?.mtg_cards?.name || card?.name || "Unknown Card";
}

function typeLine(card: any) {
  return card?.mtg_cards?.type_line || card?.type_line || "";
}

function cardImage(card: any) {
  return card?.image_normal || card?.image_large || card?.image_small || card?.image_png;
}

function price(card: any) {
  return Number(card?.price_usd || card?.price_usd_foil || card?.price_usd_etched || 0);
}

function totalOwned(card: any) {
  if (!card?.collectionEntry && card?.ownedCopies !== undefined) return Number(card.ownedCopies || 0);

  return Number(card?.collectionEntry?.quantity || 0)
    + Number(card?.collectionEntry?.foil_quantity || 0)
    + Number(card?.collectionEntry?.etched_quantity || 0);
}

function CardImage({ src, name, hidden }: { src?: string | null; name: string; hidden?: boolean }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="mtg-card-image-wrap"
      onMouseEnter={() => { if (!hidden && src) setHover(true); }}
      onMouseLeave={() => setHover(false)}
    >
      {!hidden && src ? (
        <>
          <img src={src} alt={name} className="mtg-card-image" />
          {hover ? <img src={src} alt={name} className="mtg-card-image-preview" /> : null}
        </>
      ) : (
        <div className="mtg-card-placeholder">?</div>
      )}
    </div>
  );
}

function FinishPills({ card }: { card: any }) {
  const finishes = Array.isArray(card?.finishes) ? card.finishes : [];
  if (!finishes.length) return null;

  return (
    <div className="mtg-pill-row">
      {finishes.slice(0, 4).map((finish: string) => (
        <span key={finish} className="mtg-aspect-pill">{finish}</span>
      ))}
    </div>
  );
}

export default function MtgCardTile({ card, muted = false, hidden = false, showControls = false, compactControls = false }: Props) {
  const name = cardName(card);
  const type = typeLine(card);
  const image = cardImage(card);
  const normalQuantity = Number(card?.collectionEntry?.quantity || 0);
  const foilQuantity = Number(card?.collectionEntry?.foil_quantity || 0);
  const etchedQuantity = Number(card?.collectionEntry?.etched_quantity || 0);
  const qty = totalOwned(card);
  const unitPrice = price(card);
  const totalValue = unitPrice * qty;

  return (
    <article className={`mtg-card-tile ${muted ? "is-muted" : ""} ${hidden ? "is-hidden-card" : ""}`}>
      <CardImage src={image} name={name} hidden={hidden} />

      <div className="mtg-card-tile-body">
        {hidden ? (
          <>
            <p className="mtg-card-kicker">{String(card?.set_code || "MTG").toUpperCase()} #{card?.collector_number || "—"}</p>
            <h3>Unowned Card</h3>
            <p>Details hidden. Enable Show Unowned to reveal card information.</p>
            <div className="mtg-card-value-row"><span>Qty: 0</span></div>
          </>
        ) : (
          <>
            <p className="mtg-card-kicker">{String(card?.set_code || "MTG").toUpperCase()} #{card?.collector_number || "—"} • {card?.rarity || "—"}</p>
            <h3>{name}</h3>
            <p>{type || "—"}</p>
            <FinishPills card={card} />
            <div className="mtg-card-value-row">
              <span className="mtg-card-price">Qty: {qty}</span>
              <span>Unit: {usd(unitPrice)}</span>
              <span className="mtg-card-price">Total: {usd(totalValue)}</span>
            </div>
          </>
        )}
      </div>

      {showControls ? (
        <MtgQuantityControls
          printingId={card.id}
          normalQuantity={normalQuantity}
          foilQuantity={foilQuantity}
          etchedQuantity={etchedQuantity}
          compact={compactControls}
        />
      ) : null}
    </article>
  );
}
