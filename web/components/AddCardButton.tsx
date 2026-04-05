"use client";

import { useRouter } from "next/navigation";

type Props = {
  cardId: string;
};

export default function AddCardButton({ cardId }: Props) {
  const router = useRouter();

  async function update(delta: number) {
    const res = await fetch("/api/collection/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        card_id: cardId,
        delta,
      }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="swu-card-actions">
      <button
        type="button"
        onClick={() => update(-1)}
        className="swu-stepper-btn"
        aria-label="Remove one"
      >
        −
      </button>

      <button
        type="button"
        onClick={() => update(1)}
        className="swu-stepper-btn swu-stepper-btn--primary"
        aria-label="Add one"
      >
        +
      </button>
    </div>
  );
}