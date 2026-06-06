export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function DeckCardImage({ src, label }: { src?: string | null; label: string }) {
  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div
        style={{
          width: "64px",
          height: "90px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          background: "#05070d",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <img src={src} alt={label} style={{ width: "64px", height: "90px", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ color: "var(--muted-2)", fontSize: "11px" }}>—</div>
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
        <h1>Decks</h1>
        <div className="tu-panel" style={{ color: "var(--danger)" }}>{error.message}</div>
      </main>
    );
  }

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "22px", flexWrap: "wrap" }}>
        <div>
          <div className="tu-page-kicker">Command Center</div>
          <h1>Decks</h1>
          <p className="tu-page-subtitle">Build and manage decks from cards in your collection.</p>
        </div>
        <Link href="/decks/new" className="tu-link-button">Create New Deck</Link>
      </div>

      {!decks || decks.length === 0 ? (
        <div className="tu-panel">
          <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>No decks yet</div>
          <div style={{ color: "var(--muted)", marginBottom: "16px" }}>Create your first deck to start building from your collection.</div>
          <Link href="/decks/new" className="tu-link-button">Create New Deck</Link>
        </div>
      ) : (
        <div className="tu-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {decks.map((deck: any) => {
            const leader = Array.isArray(deck.leader_card) ? deck.leader_card[0] : deck.leader_card;
            const base = Array.isArray(deck.base_card) ? deck.base_card[0] : deck.base_card;
            const mainDeckCount = (deck.deck_cards || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

            return (
              <div key={deck.id} className="tu-card">
                <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{deck.name}</div>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <DeckCardImage src={leader?.front_art} label="Leader" />
                  <DeckCardImage src={base?.front_art} label="Base" />
                  <div style={{ display: "grid", gap: "8px", color: "var(--muted)", fontSize: "14px", minWidth: 0 }}>
                    <div><span style={{ color: "var(--text)", fontWeight: 900 }}>Leader:</span> {leader?.name || "None selected"}</div>
                    <div><span style={{ color: "var(--text)", fontWeight: 900 }}>Base:</span> {base?.name || "None selected"}</div>
                    <div><span style={{ color: "var(--text)", fontWeight: 900 }}>Main Deck:</span> {mainDeckCount} / 50</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                  <Link href={`/decks/${deck.id}`} className="tu-link-button secondary">Edit Deck</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
