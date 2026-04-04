"use client";

import AddCardButton from "./AddCardButton";

export default function CardActions({
  userId,
  cardId,
}: any) {
  return (
    <div style={{ marginTop: "8px" }}>
      <AddCardButton userId={userId} cardId={cardId} />
    </div>
  );
}