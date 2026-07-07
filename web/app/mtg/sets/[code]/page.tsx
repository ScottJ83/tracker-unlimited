import "../../mtg.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import MtgProgress from "@/components/mtg/MtgProgress";
import MtgSetBinderClient from "@/components/mtg/MtgSetBinderClient";
import { getMtgSetDetail, getMtgUser } from "@/lib/mtg/queries";
import { usd } from "@/lib/mtg/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function MtgSetDetailPage({ params }: Props) {
  const { code } = await params;
  const { supabase, user } = await getMtgUser();
  const detail = await getMtgSetDetail(supabase, code, user?.id);

  if (!detail) notFound();

  const { set, printings, stats } = detail;

  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <div className="mtg-page-header">
          <div className="mtg-set-detail-symbol">
            {set.icon_svg_uri ? <img src={set.icon_svg_uri} alt="" /> : <span>✦</span>}
          </div>
          <div>
            <div className="mtg-kicker">Set Databank</div>
            <h1 className="mtg-page-title">{set.name}</h1>
            <div className="mtg-page-subtitle">
              {String(set.code || "").toUpperCase()} • {set.released_at || "Release date unknown"} • Track owned printings, hidden missing cards, set value, and completion cost.
            </div>
          </div>
        </div>

        <section className="mtg-panel mtg-summary-panel">
          <div className="mtg-grid mtg-set-stat-grid">
            <div className="mtg-stat"><span>Base</span><strong>{stats.baseOwned} / {stats.baseTotal}</strong></div>
            <div className="mtg-stat"><span>Full</span><strong>{stats.ownedPrintings} / {stats.totalPrintings}</strong></div>
            <div className="mtg-stat"><span>Owned Value</span><strong>{usd(stats.ownedValue)}</strong></div>
            <div className="mtg-stat"><span>Cost To Complete</span><strong>{usd(stats.missingFullCost)}</strong></div>
          </div>

          <MtgProgress label="Base Set Completion" value={stats.baseCompletion} detail={`${stats.baseOwned} / ${stats.baseTotal} unique cards owned`} />
          <MtgProgress label="Full Set Completion" value={stats.completion} detail={`${stats.ownedPrintings} / ${stats.totalPrintings} printings owned`} />

          <div className="mtg-data-row">
            <div>Base Missing Cost: {usd(stats.missingBaseCost)}</div>
            <div>Full Missing Cost: {usd(stats.missingFullCost)}</div>
          </div>
        </section>

        <section className="mtg-panel">
          <MtgSetBinderClient printings={printings} defaultHideMissing />
        </section>

        <div className="mtg-actions mtg-bottom-actions">
          <Link className="mtg-button secondary" href="/mtg/sets">Back to Sets</Link>
          <Link className="mtg-button secondary" href="/mtg/collection">Collection</Link>
        </div>
      </div>
    </main>
  );
}
