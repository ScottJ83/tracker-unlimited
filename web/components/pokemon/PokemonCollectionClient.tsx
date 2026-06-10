"use client";

import { useMemo, useState } from "react";
import PokemonPrintCard from "./PokemonPrintCard";

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
      const card = Array.isArray(print?.pokemon_cards) ? print.pokemon_cards[0] : print?.pokemon_cards;
      const set = Array.isArray(print?.pokemon_sets) ? print.pokemon_sets[0] : print?.pokemon_sets;
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
        {rows.map((print: any) => (
          <PokemonPrintCard
            key={print.id}
            print={print}
            quantity={Number(ownedByPrint.get(print.id)?.quantity || 0)}
            wished={wished.has(print.id)}
          />
        ))}
      </div>
    </div>
  );
}
