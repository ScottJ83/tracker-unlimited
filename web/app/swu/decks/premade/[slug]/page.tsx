import Link from "next/link";
import { notFound } from "next/navigation";
import { getPremadeDeckBySlug } from "@/lib/swu/premadeDecks";

type PageProps = { params: Promise<{ slug: string }> };

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default async function PremadeDeckDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const deck = await getPremadeDeckBySlug(slug);
  if (!deck) notFound();

  return (
    <main className="sw-page-shell premade-page-shell">
      <section className="sw-hero-block compact premade-detail-hero">
        <div>
          <p className="sw-eyebrow">{deck.deck_type}</p>
          <h1>{deck.name}</h1>
          <p className="sw-muted">{deck.product_wave}</p>
        </div>
        <Link href="/swu/decks/premade" className="sw-button">All Pre-Made Decks</Link>
      </section>

      <section className="premade-summary sw-card-panel">
        <div>
          <p className="sw-eyebrow">Completion</p>
          <strong>{deck.completion}%</strong>
        </div>
        <div>
          <p className="sw-eyebrow">Copies Owned</p>
          <strong>{deck.ownedCopies} / {deck.requiredCopies}</strong>
        </div>
        <div>
          <p className="sw-eyebrow">Cards Complete</p>
          <strong>{deck.completedLines} / {deck.totalLines}</strong>
        </div>
        <div>
          <p className="sw-eyebrow">Remaining Cost</p>
          <strong>{money(deck.remainingValue)}</strong>
        </div>
      </section>

      <section className="premade-progress-card sw-card-panel">
        <div className="premade-progress-row">
          <span>Deck Progress</span>
          <span>{deck.missingCopies} missing copies</span>
        </div>
        <div className="premade-progress-track"><span style={{ width: `${deck.completion}%` }} /></div>
      </section>

      <section className="premade-card-grid">
        {deck.cards.map((line) => (
          <article key={`${line.id}`} className={`premade-card-tile sw-card-panel ${line.isComplete ? "is-complete" : "is-missing"}`}>
            <div className="premade-card-image-wrap">
              {line.image ? <img src={line.image} alt={line.displayName} /> : <div className="premade-card-placeholder">?</div>}
            </div>
            <div className="premade-card-copy">
              <p className="sw-eyebrow">{line.setLine || line.type}</p>
              <h3>{line.displayName}</h3>
              {line.subtitle ? <p className="sw-muted small">{line.subtitle}</p> : null}
              <p className="premade-owned-line">Owned {line.countedOwned} / {line.required}</p>
              {line.missing > 0 ? <p className="premade-missing-line">Need {line.missing} more</p> : <p className="premade-complete-line">Complete</p>}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
