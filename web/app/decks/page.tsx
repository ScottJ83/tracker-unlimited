export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function DeckCardImage({ src, label }: { src?: string | null; label: string }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{label}</div>
      <div
        style={{
          width: "64px",
          height: "90px",
          borderRadius: "10px",
          border: "1px solid #334155",
          background: "#0b1220",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            style={{
              width: "64px",
              height: "90px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div style={{ color: "#475569", fontSize: "11px" }}>—</div>
        )}
      </div>
    </div>
  );
}

export default async function DecksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: decks, error } = await supabase
    .from("decks")
    .select(`
      id,
      name,
      created_at,
      updated_at,
      leader_card:leader_card_id (
        id,
        name,
        subtitle,
        front_art
      ),
      base_card:base_card_id (
        id,
        name,
        subtitle,
        front_art
      ),
      deck_cards (
        quantity
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <main>
        <h1 style={{ marginBottom: "18px" }}>Decks</h1>
        <div
          style={{
            border: "1px solid #7f1d1d",
            background: "#2a0f14",
            color: "#fecaca",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          {error.message}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Decks</h1>
          <div style={{ color: "#94a3b8", marginTop: "6px" }}>
            Build and manage decks from cards in your collection.
          </div>
        </div>

        <Link
          href="/decks/new"
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#1e293b",
            border: "1px solid #475569",
            color: "#e5edf7",
            fontWeight: 700,
          }}
        >
          Create New Deck
        </Link>
      </div>

      {!decks || decks.length === 0 ? (
        <div
          style={{
            border: "1px solid #334155",
            borderRadius: "18px",
            padding: "24px",
            background: "linear-gradient(180deg, #172033, #111827)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
            No decks yet
          </div>
          <div style={{ color: "#cbd5e1", marginBottom: "16px" }}>
            Create your first deck to start building from your collection.
          </div>
          <Link
            href="/decks/new"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#1e293b",
              border: "1px solid #475569",
              color: "#e5edf7",
              fontWeight: 700,
            }}
          >
            Create New Deck
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px",
          }}
        >
          {decks.map((deck: any) => {
            const leader = Array.isArray(deck.leader_card)
              ? deck.leader_card[0]
              : deck.leader_card;

            const base = Array.isArray(deck.base_card)
              ? deck.base_card[0]
              : deck.base_card;

            const mainDeckCount = (deck.deck_cards || []).reduce(
              (sum: number, item: any) => sum + Number(item.quantity || 0),
              0
            );

            return (
              <div
                key={deck.id}
                style={{
                  border: "1px solid #334155",
                  borderRadius: "18px",
                  padding: "18px",
                  background: "linear-gradient(180deg, #172033, #111827)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "14px",
                    color: "#e5edf7",
                  }}
                >
                  {deck.name}
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <DeckCardImage src={leader?.front_art} label="Leader" />
                  <DeckCardImage src={base?.front_art} label="Base" />

                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                      color: "#cbd5e1",
                      fontSize: "14px",
                      minWidth: 0,
                    }}
                  >
                    <div>
                      <span style={{ color: "#94a3b8" }}>Leader:</span>{" "}
                      {leader?.name || "None selected"}
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8" }}>Base:</span>{" "}
                      {base?.name || "None selected"}
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8" }}>Main Deck Cards:</span>{" "}
                      {mainDeckCount} / 50
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/decks/${deck.id}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "#1e293b",
                      border: "1px solid #475569",
                      color: "#e5edf7",
                      fontWeight: 700,
                    }}
                  >
                    Edit Deck
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
