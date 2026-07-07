"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  printingId: string;
  normalQuantity?: number;
  foilQuantity?: number;
  etchedQuantity?: number;
  compact?: boolean;
};

export default function MtgQuantityControls({
  printingId,
  normalQuantity = 0,
  foilQuantity = 0,
  etchedQuantity = 0,
  compact = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(finish: "normal" | "foil" | "etched", action: "increment" | "decrement") {
    const key = `${finish}-${action}`;
    setLoading(key);

    try {
      const response = await fetch("/api/mtg/collection/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printingId, finish, action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Could not update collection.");
    } finally {
      setLoading(null);
    }
  }

  const total = Number(normalQuantity || 0) + Number(foilQuantity || 0) + Number(etchedQuantity || 0);

  return (
    <div className={compact ? "mtg-qty mtg-qty-compact" : "mtg-qty"}>
      <div className="mtg-qty-total">Owned {total}</div>

      <div className="mtg-qty-row">
        <span>Normal</span>
        <button disabled={loading !== null} onClick={() => update("normal", "decrement")}>−</button>
        <strong>{normalQuantity}</strong>
        <button disabled={loading !== null} onClick={() => update("normal", "increment")}>+</button>
      </div>

      {!compact ? (
        <>
          <div className="mtg-qty-row">
            <span>Foil</span>
            <button disabled={loading !== null} onClick={() => update("foil", "decrement")}>−</button>
            <strong>{foilQuantity}</strong>
            <button disabled={loading !== null} onClick={() => update("foil", "increment")}>+</button>
          </div>

          <div className="mtg-qty-row">
            <span>Etched</span>
            <button disabled={loading !== null} onClick={() => update("etched", "decrement")}>−</button>
            <strong>{etchedQuantity}</strong>
            <button disabled={loading !== null} onClick={() => update("etched", "increment")}>+</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
