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

  const btnStyle = {
    width: "34px",
    height: "34px",
    border: "1px solid rgba(148, 163, 184, 0.38)",
    borderRadius: "10px",
    background:
      "linear-gradient(180deg, rgba(21, 35, 64, 0.98), rgba(10, 18, 33, 0.98))",
    color: "#edf4ff",
    cursor: "pointer",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 12px rgba(125,211,252,0.08)",
    fontSize: "18px",
    lineHeight: 1,
  } as const;

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button type="button" onClick={() => update(-1)} style={btnStyle}>
        −
      </button>
      <button type="button" onClick={() => update(1)} style={btnStyle}>
        +
      </button>
    </div>
  );
}