import Link from "next/link";
import PokemonQuantityButton from "./PokemonQuantityButton";
import PokemonWishlistButton from "./PokemonWishlistButton";

function joined(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PokemonPrintCard({
  print,
  quantity = 0,
  wished = false,
  linkCard = true,
}: {
  print: any;
  quantity?: number;
  wished?: boolean;
  linkCard?: boolean;
}) {
  const card = joined(print?.pokemon_cards) || print?.card || {};
  const set = joined(print?.pokemon_sets) || print?.set || {};
  const href = `/pokemon/cards/${card.id || print.card_id}`;

  const image = (
    <div className="pkdx-card-image">
      {print.image || card.image ? <img src={print.image || card.image} alt={card.name || "Pokémon card"} /> : "?"}
    </div>
  );

  const content = (
    <>
      {image}
      <div className="pkdx-card-info">
        <h3>{card.name || "Unknown Card"}</h3>
        <p>{set.name || "Unknown Set"} #{card.local_id || "-"}</p>
        <p>{print.print_name || "Standard"} • {card.rarity || "Unknown rarity"}</p>
        <div className="pkdx-card-price">
          Qty: {quantity} • Market: ${Number(print.price_market || 0).toFixed(2)}
        </div>
      </div>
    </>
  );

  return (
    <article className="pkdx-card-tile">
      {linkCard ? <Link href={href} className="pkdx-card-main-link">{content}</Link> : content}
      <div className="pkdx-card-actions">
        <PokemonQuantityButton printId={print.id} quantity={quantity} />
        <PokemonWishlistButton printId={print.id} wished={wished} />
      </div>
    </article>
  );
}
