"use client";

import { useMemo, useState } from "react";
import PokemonQuantityButton from "./PokemonQuantityButton";
import PokemonWishlistButton from "./PokemonWishlistButton";

function cardFromPrint(print: any) {
  return Array.isArray(print?.pokemon_cards) ? print.pokemon_cards[0] : print?.pokemon_cards;
}

function setFromPrint(print: any) {
  return Array.isArray(print?.pokemon_sets) ? print.pokemon_sets[0] : print?.pokemon_sets;
}

export default function PokemonCollectionClient({
  prints,
  owned,
  wishlist,
}: {
  prints: any[];
  owned: any[];
  wishlist: any[];
}) {
  const [tab, setTab] = useState<"owned" | "uncollected" | "wishlist">("owned");
  const [search, setSearch] = useState("");

  const ownedByPrint = new Map((owned || []).map((entry: any) => [entry.print_id, entry]));
  const wished = new Set((wishlist || []).map((entry: any) => entry.print_id));

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (prints || []).filter((print: any) => {
      const card = cardFromPrint(print);
      const set = setFromPrint(print);
      const quantity = Number(ownedByPrint.get(print.id)?.quantity || 0);
      const isWished = wished.has(print.id);

      if (tab === "owned" && quantity <= 0) return false;
      if (tab === "uncollected" && quantity > 0) return false;
      if (tab === "wishlist" && !isWished) return false;

      const haystack = [
        card?.name,
        card?.local_id,
        card?.rarity,
        card?.types?.join(" "),
        set?.name,
        print?.print_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || haystack.includes(q);
    });
  }, [prints, owned, wishlist, tab, search]);

  return (
    <div className="pkdx-collection-shell">
      <section className="pkdx-tab-bar">
        {[
          ["owned", "Owned"],
          ["uncollected", "Uncollected"],
          ["wishlist", "Wishlist"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "pkdx-tab-active" : ""}
            onClick={() => setTab(key as any)}
          >
            {label}
          </button>
        ))}

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Pokémon, set, rarity, or variant"
        />
      </section>

      <div className="pkdx-card-grid">
        {rows.map((print: any) => {
          const card = cardFromPrint(print);
          const set = setFromPrint(print);
          const quantity = Number(ownedByPrint.get(print.id)?.quantity || 0);

          return (
            <article key={print.id} className="pkdx-card-tile">
              <div className="pkdx-card-image">
                {print.image || card?.image ? <img src={print.image || card?.image} alt={card?.name || "Pokémon card"} /> : "?"}
              </div>

              <div className="pkdx-card-info">
                <h3>{card?.name || "Unknown Card"}</h3>
                <p>{set?.name || "Unknown Set"} #{card?.local_id || "-"}</p>
                <p>{print.print_name} • {card?.rarity || "Unknown rarity"}</p>
                <div className="pkdx-card-price">
                  Qty: {quantity} • Market: ${Number(print.price_market || 0).toFixed(2)}
                </div>
              </div>

              <div className="pkdx-card-actions">
                <PokemonQuantityButton printId={print.id} quantity={quantity} />
                <PokemonWishlistButton printId={print.id} wished={wished.has(print.id)} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
