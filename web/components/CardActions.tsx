"use client";

import AddCardButton from "./AddCardButton";

export default function CardActions({ cardId }: any) {
  return (
    <div style={{ marginTop: "8px" }}>
      <AddCardButton cardId={cardId} />
    </div>
  );
}