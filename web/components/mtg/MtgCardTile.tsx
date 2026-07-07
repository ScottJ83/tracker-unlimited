import MtgQuantityControls from "./MtgQuantityControls";

const MTG_CARD_BACK =
  "https://cards.scryfall.io/back/normal/0/0/00000000-0000-0000-0000-000000000000.jpg";

type Props = {
  card: any;
  muted?: boolean;
  showControls?: boolean;
  compactControls?: boolean;
  revealUnownedImages?: boolean;
};

function cardName(card: any) {
  return card?.mtg_cards?.name || card?.name || "Unknown Card";
}

function typeLine(card: any) {
  return card?.mtg_cards?.type_line || card?.type_line || "";
}

function manaCost(card: any) {
  return card?.mtg_cards?.mana_cost || card?.mana_cost || "";
}

function setLine(card: any) {
  const setCode = String(card?.set_code || "MTG").toUpperCase();
  const number = card?.collector_number || "—";
  const rarity = card?.rarity ? String(card.rarity).toUpperCase() : "RARITY UNKNOWN";
  return `${setCode} #${number} • ${rarity}`;
}

function priceLine(card: any) {
  const normal = Number(card?.price_usd || 0);
  const foil = Number(card?.price_usd_foil || 0);
  const etched = Number(card?.price_usd_etched || 0);
  const price = normal || foil || etched;
  return price ? `$${price.toFixed(2)}` : "No price";
}

export default function MtgCardTile({
  card,
  muted = false,
  showControls = false,
  compactControls = false,
  revealUnownedImages = false,
}: Props) {
  const name = cardName(card);
  const image = card?.image_normal || card?.image_large || card?.image_small;
  const normalQuantity = Number(card?.collectionEntry?.quantity || 0);
  const foilQuantity = Number(card?.collectionEntry?.foil_quantity || 0);
  const etchedQuantity = Number(card?.collectionEntry?.etched_quantity || 0);
  const ownedCopies = normalQuantity + foilQuantity + etchedQuantity;
  const isOwned = ownedCopies > 0 || card?.isOwned;
  const shouldShowImage = isOwned || revealUnownedImages;

  return (
    <article className={`mtg-card-tile mtg-card-row ${muted ? "is-muted" : ""} ${isOwned ? "is-owned" : "is-unowned"}`}>
      <div className="mtg-card-image-wrap mtg-card-row-image">
        {shouldShowImage && image ? (
          <img src={image} alt={name} />
        ) : (
          <div className="mtg-card-back-placeholder" aria-label="Unowned card image hidden">
            <img src={MTG_CARD_BACK} alt="Magic card back" />
            <span>Unowned Card</span>
          </div>
        )}
      </div>

      <div className="mtg-card-tile-body mtg-card-row-body">
        <p className="mtg-card-kicker">{setLine(card)}</p>
        <div className="mtg-card-title-row">
          <h3>{name}</h3>
          {manaCost(card) ? <span className="mtg-mana-cost">{manaCost(card)}</span> : null}
        </div>
        <p className="mtg-type-line">{typeLine(card)}</p>
        <div className="mtg-card-meta-row">
          <span>{priceLine(card)}</span>
          <span>{isOwned ? `Owned ${ownedCopies}` : "Not in collection"}</span>
        </div>
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
