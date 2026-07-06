export default function MtgCardTile({ card, muted = false }: { card: any; muted?: boolean }) {
  const name = card?.mtg_cards?.name || card?.name || "Unknown Card";
  const typeLine = card?.mtg_cards?.type_line || card?.type_line || "";
  const image = card?.image_normal || card?.image_large || card?.image_small;
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
    </article>
  );
}
