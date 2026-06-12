export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDeckTotalCards, premadeDecks, parseCardCode } from "@/lib/swu/premadeDecks";

async function getAllCollection(supabase: any, userId: string) {
  let rows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("collection_entries")
      .select("quantity, cards(id, set_code, card_number)")
      .eq("user_id", userId)
      .gt("quantity", 0)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows = rows.concat(data);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function codeKey(setCode: string, cardNumber: any) {
  return `${String(setCode || "").toUpperCase()}_${String(cardNumber || "").replace(/^0+/, "")}`;
}

export default async function PremadeDecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const collection = await getAllCollection(supabase, user.id);
  const ownedByCode = new Map<string, number>();

  for (const row of collection || []) {
    const card = Array.isArray(row.cards) ? row.cards[0] : row.cards;
    if (!card) continue;

    const key = codeKey(card.set_code, card.card_number);
    ownedByCode.set(key, (ownedByCode.get(key) || 0) + Number(row.quantity || 0));
  }

  return (
    <main>
      <div className="sw-page-header">
        <div className="sw-kicker">Deck Database</div>
        <h1 className="sw-page-title">Pre-Made Decks</h1>
        <div className="sw-page-subtitle">
          Track official Spotlight and Twin Suns decks against your collection. Missing cards stay visible so you can gather them over time.
        </div>
      </div>

      <div className="sw-grid">
        {premadeDecks.map((deck) => {
          const total = getDeckTotalCards(deck);
          const owned = deck.entries.reduce((sum, item) => {
            const parsed = parseCardCode(item.code);
            const ownedCopies = ownedByCode.get(`${parsed.setCode}_${Number(parsed.cardNumber)}`) || 0;
            return sum + Math.min(item.quantity, ownedCopies);
          }, 0);
          const pct = total ? Math.round((owned / total) * 1000) / 10 : 0;

          return (
            <Link key={deck.slug} href={`/swu/decks/premade/${deck.slug}`} className="sw-card premade-deck-card">
              <div className="sw-kicker">{deck.productType}</div>
              <div className="sw-section-title" style={{ fontSize: "22px", marginTop: "8px" }}>{deck.name}</div>
              <div className="sw-muted" style={{ marginTop: "8px", lineHeight: 1.5 }}>{deck.description}</div>

              <div className="premade-progress-block">
                <div className="premade-progress-top">
                  <span>Completion</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="premade-progress-bar"><span style={{ width: `${pct}%` }} /></div>
                <div className="sw-muted" style={{ marginTop: "8px" }}>{owned} / {total} cards owned</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
