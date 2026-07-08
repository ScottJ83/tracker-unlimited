import MtgQuantityControls from "./MtgQuantityControls";
import { usd } from "@/lib/mtg/format";

type Props = {
  card: any;
  muted?: boolean;
  showControls?: boolean;
  compactControls?: boolean;
  revealUnowned?: boolean;
};

export default function MtgCardTile({ card, muted = false, showControls = false, compactControls = false, revealUnowned = false }: Props) {
  const isOwned = Boolean(card?.isOwned);
  const hidden = !isOwned && !revealUnowned;
  const name = card?.mtg_cards?.name || card?.name || "Unknown Card";
  const typeLine = card?.mtg_cards?.type_line || card?.type_line || "";
  const manaCost = card?.mtg_cards?.mana_cost || card?.mana_cost || "";
  const image = card?.image_normal || card?.image_large || card?.image_small;
  const quantity = Number(card?.collectionEntry?.quantity || 0);
  const finish = card?.finish_label || card?.finish || "Printing";
  const variant = card?.variant_label || "Standard";
  const price = Number(card?.price_usd || 0);
  const setCode = String(card?.set_code || "MTG").toUpperCase();
  const number = card?.collector_number || "—";

  return (
    <article className={`mtg-card-tile mtg-binder-card ${muted ? "is-muted" : ""} ${hidden ? "is-hidden-card" : ""}`}>
      <div className="mtg-card-image-wrap mtg-hover-preview">
        {!hidden && image ? <img src={image} alt={name} /> : <div className="mtg-card-back-placeholder"><span>MTG</span></div>}
      </div>

      <div className="mtg-card-tile-body">
        <p className="mtg-card-kicker">{setCode} #{number} • {finish}</p>
        <h3>{hidden ? "Unowned Card" : name}</h3>
        <p>{hidden ? "Add a copy to reveal this collectible." : typeLine}</p>
        {!hidden ? <p className="mtg-card-detail-line">{manaCost || "—"} • {card?.rarity || "unknown"} • {variant}</p> : null}
        {!hidden && price ? <p className="mtg-card-price">{usd(price)}</p> : null}
      </div>

      {showControls ? <MtgQuantityControls printingId={card.id} quantity={quantity} compact={compactControls} /> : null}
    </article>
  );
}
