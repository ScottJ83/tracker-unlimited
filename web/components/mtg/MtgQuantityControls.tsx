"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  printingId: string;
  quantity?: number;
  normalQuantity?: number;
  compact?: boolean;
};

export default function MtgQuantityControls({ printingId, quantity, normalQuantity = 0, compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const current = Number(quantity ?? normalQuantity ?? 0);

  async function update(action: "increment" | "decrement") {
    setLoading(action);

    try {
      const response = await fetch("/api/mtg/collection/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printingId, action }),
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

  return (
    <div className={compact ? "mtg-qty mtg-qty-compact" : "mtg-qty"}>
      <div className="mtg-qty-total">Owned {current}</div>
      <div className="mtg-qty-row mtg-qty-single-row">
        <button disabled={loading !== null} onClick={() => update("decrement")} aria-label="Remove one copy">−</button>
        <strong>{current}</strong>
        <button disabled={loading !== null} onClick={() => update("increment")} aria-label="Add one copy">+</button>
      </div>
    </div>
  );
}
