export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function DeckCardImage({ src, label }: { src?: string | null; label: string }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <div style={{ fontSize: "11px", color: "var(--sw-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div
        style={{
          width: "64px",
          height: "90px",
          borderRadius: "8px",
          border: "1px solid var(--sw-border)",
          background: "rgba(0,0,0,0.46)",
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
          <div style={{ color: "var(--sw-dim)", fontSize: "11px" }}>—</div>
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
        <h1 className="sw-page-title">Decks</h1>
        <div className="sw-panel" style={{ padding: "18px", marginTop: "18px", color: "#fecaca" }}>
          {error.message}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="sw-page-header" style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div className="sw-kicker">Deck Database</div>
          <h1 className="sw-page-title">Decks</h1>
          <div className="sw-page-subtitle">Build and manage decks from cards in your collection.</div>
        </div>

        <Link href="/decks/new" className="sw-button">Create New Deck</Link>
      </div>

      {!decks || decks.length === 0 ? (
        <div className="sw-shell">
          <div className="sw-section-title" style={{ fontSize: "22px", marginBottom: "8px" }}>No decks yet</div>
          <div className="sw-muted" style={{ marginBottom: "16px" }}>
            Create your first deck to start building from your collection.
          </div>
          <Link href="/decks/new" className="sw-button">Create New Deck</Link>
        </div>
      ) : (
        <div className="sw-grid">
          {decks.map((deck: any) => {
            const leader = Array.isArray(deck.leader_card) ? deck.leader_card[0] : deck.leader_card;
            const base = Array.isArray(deck.base_card) ? deck.base_card[0] : deck.base_card;

            const mainDeckCount = (deck.deck_cards || []).reduce(
              (sum: number, item: any) => sum + Number(item.quantity || 0),
              0
            );

            return (
              <div key={deck.id} className="sw-card" style={{ padding: "18px" }}>
                <div className="sw-section-title" style={{ fontSize: "20px", marginBottom: "14px" }}>{deck.name}</div>

                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <DeckCardImage src={leader?.front_art} label="Leader" />
                  <DeckCardImage src={base?.front_art} label="Base" />

                  <div className="sw-data-row" style={{ display: "grid", gap: "8px", minWidth: 0 }}>
                    <div><span className="sw-muted">Leader:</span> {leader?.name || "None selected"}</div>
                    <div><span className="sw-muted">Base:</span> {base?.name || "None selected"}</div>
                    <div><span className="sw-muted">Main Deck:</span> {mainDeckCount} / 50</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                  <Link href={`/decks/${deck.id}`} className="sw-button secondary">Edit Deck</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
