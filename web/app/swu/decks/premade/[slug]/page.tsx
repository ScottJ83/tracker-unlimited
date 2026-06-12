export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDeckTotalCards, getPremadeDeck, parseCardCode } from "@/lib/swu/premadeDecks";

type Props = { params: Promise<{ slug: string }> };

async function getCardsForDeck(supabase: any, deck: any) {
  const setCodes = Array.from(new Set(deck.entries.map((entry: any) => parseCardCode(entry.code).setCode)));
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .in("set_code", setCodes);

  if (error) throw error;
  return data || [];
}

async function getCollection(supabase: any, userId: string) {
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

function getDisplayCard(cards: any[], code: string) {
  const parsed = parseCardCode(code);
  const candidates = cards.filter((card) => codeKey(card.set_code, card.card_number) === `${parsed.setCode}_${Number(parsed.cardNumber)}`);

  return (
    candidates.find((card) => String(card.variant || "").toLowerCase().includes("standard")) ||
    candidates.find((card) => !String(card.variant || "").toLowerCase().includes("hyperspace")) ||
    candidates[0] ||
    null
  );
}

function CardImage({ card, missing }: { card: any; missing: boolean }) {
  return (
    <div className="premade-card-image">
      {card?.front_art ? <img src={card.front_art} alt={card.name || "Card"} /> : <div>?</div>}
      {missing ? <span className="premade-missing-stamp">Missing</span> : null}
    </div>
  );
}

export default async function PremadeDeckDetailPage({ params }: Props) {
  const { slug } = await params;
  const deck = getPremadeDeck(slug);
  if (!deck) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [cards, collection] = await Promise.all([
    getCardsForDeck(supabase, deck),
    getCollection(supabase, user.id),
  ]);

  const ownedByCode = new Map<string, number>();
  for (const row of collection || []) {
    const card = Array.isArray(row.cards) ? row.cards[0] : row.cards;
    if (!card) continue;
    const key = codeKey(card.set_code, card.card_number);
    ownedByCode.set(key, (ownedByCode.get(key) || 0) + Number(row.quantity || 0));
  }

  const rows = deck.entries.map((entry) => {
    const parsed = parseCardCode(entry.code);
    const key = `${parsed.setCode}_${Number(parsed.cardNumber)}`;
    const owned = ownedByCode.get(key) || 0;
    const card = getDisplayCard(cards, entry.code);

    return {
      ...entry,
      parsed,
      key,
      owned,
      ownedCapped: Math.min(entry.quantity, owned),
      card,
      missing: owned <= 0,
      incomplete: owned < entry.quantity,
    };
  });

  const total = getDeckTotalCards(deck);
  const ownedTotal = rows.reduce((sum, row) => sum + row.ownedCapped, 0);
  const completeRows = rows.filter((row) => row.owned >= row.quantity).length;
  const pct = total ? Math.round((ownedTotal / total) * 1000) / 10 : 0;

  return (
    <main>
      <div className="sw-page-header" style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div className="sw-kicker">{deck.productType}</div>
          <h1 className="sw-page-title">{deck.name}</h1>
          <div className="sw-page-subtitle">Pre-made deck checklist. Cards are visible even when missing and become fully lit when they are in your collection.</div>
        </div>
        <Link href="/swu/decks/premade" className="sw-button secondary">All Pre-Made Decks</Link>
      </div>

      <section className="sw-shell premade-summary-shell">
        <div className="premade-summary-grid">
          <div>
            <div className="sw-kicker">Completion</div>
            <div className="premade-large-percent">{pct}%</div>
            <div className="premade-progress-bar large"><span style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="premade-stat"><span>Owned Copies</span><strong>{ownedTotal} / {total}</strong></div>
          <div className="premade-stat"><span>Completed Lines</span><strong>{completeRows} / {rows.length}</strong></div>
          <div className="premade-stat"><span>Missing Copies</span><strong>{Math.max(0, total - ownedTotal)}</strong></div>
        </div>
      </section>

      <section className="premade-deck-grid">
        {rows.map((row) => (
          <article key={row.code} className={row.missing ? "premade-card-tile missing" : row.incomplete ? "premade-card-tile partial" : "premade-card-tile complete"}>
            <CardImage card={row.card} missing={row.missing} />
            <div className="premade-card-body">
              <div className="premade-card-topline">
                <span>{row.code}</span>
                <strong>{row.ownedCapped} / {row.quantity}</strong>
              </div>
              <h3>{row.card?.name || row.code}</h3>
              <p>{row.card?.subtitle || ""}</p>
              <div className="premade-card-meta">
                <span>{row.parsed.setCode} #{row.parsed.cardNumber}</span>
                <span>{row.card?.card_type || "Card"}</span>
                {row.card?.arena ? <span>{row.card.arena}</span> : null}
              </div>
              <div className="premade-owned-note">
                {row.missing
                  ? "Not in collection yet"
                  : row.incomplete
                    ? `Need ${row.quantity - row.ownedCapped} more`
                    : "Ready"}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
