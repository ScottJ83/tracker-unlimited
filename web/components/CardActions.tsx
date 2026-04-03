"use client";

import { useState } from "react";
import AddCardButton from "./AddCardButton";

export default function CardActions({
  userId,
  cardId,
  variants,
}: any) {
  const [variantId, setVariantId] = useState(variants?.[0]?.id);

  return (
    <div style={{ marginTop: "8px" }}>
      <select
        value={variantId}
        onChange={(e) => setVariantId(e.target.value)}
      >
        {variants?.map((v: any) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <AddCardButton
        userId={userId}
        cardId={cardId}
        variantId={variantId}
      />
    </div>
  );
}