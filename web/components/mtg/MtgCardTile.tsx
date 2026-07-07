import MtgQuantityControls from "./MtgQuantityControls";

type Props = {
  card: any;
  muted?: boolean;
  showControls?: boolean;
  compactControls?: boolean;
};

export default function MtgCardTile({ card, muted = false, showControls = false, compactControls = false }: Props) {
  const name = card?.mtg_cards?.name || card?.name || "Unknown Card";
  const typeLine = card?.mtg_cards?.type_line || card?.type_line || "";
  const image = card?.image_normal || card?.image_large || card?.image_small;
  const normalQuantity = Number(card?.collectionEntry?.quantity || 0);
  const foilQuantity = Number(card?.collectionEntry?.foil_quantity || 0);
  const etchedQuantity = Number(card?.collectionEntry?.etched_quantity || 0);

  return (
    <article className={`mtg-card-tile ${muted ? "is-muted" : ""}`}>
      <div className="mtg-card-image-wrap">
        {image ? <img src={image} alt={name} /> : <div className="mtg-card-placeholder">?</div>}
      </div>
      <div className="mtg-card-tile-body">
        <p className="mtg-card-kicker">{String(card?.set_code || "MTG").toUpperCase()} #{card?.collector_number || "—"}</p>
        <h3>{name}</h3>
        <p>{typeLine}</p>
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
