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
        <section className="mtg-hero mtg-set-detail-hero">
          <div className="mtg-set-detail-symbol">
            {set.icon_svg_uri ? <img src={set.icon_svg_uri} alt="" /> : <span>✦</span>}
          </div>

          <p className="mtg-kicker">{set.set_type || "Magic Set"}</p>
          <h1>{set.name}</h1>
          <p>
            {String(set.code || "").toUpperCase()} • {set.released_at || "Release date unknown"} • {stats.totalPrintings} imported printings
          </p>

          <div className="mtg-actions">
            <Link className="mtg-button secondary" href="/mtg/sets">Back to Sets</Link>
            <Link className="mtg-button secondary" href="/mtg/collection">Collection</Link>
          </div>
        </section>

        <section className="mtg-panel">
          <div className="mtg-grid mtg-set-stat-grid">
            <div className="mtg-stat"><span>Completion</span><strong>{stats.completion}%</strong></div>
            <div className="mtg-stat"><span>Owned Printings</span><strong>{stats.ownedPrintings} / {stats.totalPrintings}</strong></div>
            <div className="mtg-stat"><span>Owned Copies</span><strong>{stats.ownedCopies}</strong></div>
            <div className="mtg-stat"><span>Owned Value</span><strong>{usd(stats.ownedValue)}</strong></div>
          </div>

          <MtgProgress
            label="Set Completion"
            value={stats.completion}
            detail={`${stats.ownedPrintings} / ${stats.totalPrintings} printings owned`}
          />
        </section>

        <section className="mtg-panel">
          <MtgSetBinderClient printings={printings} />
        </section>
      </div>
    </main>
  );
}
