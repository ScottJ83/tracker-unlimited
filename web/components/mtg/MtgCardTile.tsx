import MtgQuantityControls from "./MtgQuantityControls";

type Props = {
  card: any;
  muted?: boolean;
  showControls?: boolean;
  compactControls?: boolean;
};

function price(card: any) {
  const value = Number(card?.price_usd || card?.price_usd_foil || card?.price_usd_etched || 0);
  return value ? `$${value.toFixed(2)}` : "—";
}

export default function MtgCardTile({ card, muted = false, showControls = false, compactControls = false }: Props) {
  const isOwned = Boolean(card?.isOwned || Number(card?.ownedCopies || 0) > 0);
  const name = card?.display_name || card?.full_name || card?.mtg_cards?.name || card?.name || "Unknown Card";
  const typeLine = card?.mtg_cards?.type_line || card?.type_line || "";
  const image = card?.image_normal || card?.image_large || card?.image_small;
  const quantity = Number(card?.collectionEntry?.quantity || card?.ownedCopies || 0);
  const finish = card?.finish_label || card?.finish || "Printing";
  const variant = card?.variant_label || "Standard";
  const collectibleType = card?.collectible_type || (card?.is_token ? "token" : "card");

  return (
    <article className={`mtg-card-tile mtg-binder-card ${muted || !isOwned ? "is-muted" : ""} ${!isOwned ? "is-hidden-card" : "is-owned-card"}`}>
      <div className="mtg-card-image-wrap mtg-hover-zoom-wrap">
        {isOwned && image ? <img src={image} alt={name} /> : <div className="mtg-card-back-placeholder">MTG</div>}
      </div>

      <div className="mtg-card-tile-body">
        <p className="mtg-card-kicker">
          {String(card?.set_code || "MTG").toUpperCase()} #{card?.collector_number || "—"} • {finish}
        </p>

        <h3>{isOwned ? name : "Unowned Card"}</h3>

        <p>{isOwned ? typeLine : "Add this printing to reveal details."}</p>

        {isOwned ? (
          <p className="mtg-printing-meta">{variant} • {collectibleType} • {price(card)}</p>
        ) : (
          <p className="mtg-printing-meta">Hidden until collected</p>
        )}
      </div>

      {showControls ? (
        <MtgQuantityControls
          printingId={card.id}
          quantity={quantity}
          compact={compactControls}
        />
      ) : null}
    </article>
  );
}
