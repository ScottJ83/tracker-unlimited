"use client";

import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  cardId: string;
};

export default function AddCardButton({ userId, cardId }: Props) {
  const router = useRouter();

  async function update(delta: number) {
    const res = await fetch("/api/collection/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        card_id: cardId,
        delta,
      }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  const btnStyle = {
    width: "34px",
    height: "34px",
    border: "1px solid #475569",
    borderRadius: "10px",
    background: "#1e293b",
    color: "#e5edf7",
    cursor: "pointer",
  } as const;

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
      <button type="button" onClick={() => update(-1)} style={btnStyle}>
        -
      </button>
      <button type="button" onClick={() => update(1)} style={btnStyle}>
        +
      </button>
    </div>
  );
}