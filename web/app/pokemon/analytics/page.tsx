import { redirect } from "next/navigation";
import { getPokemonCounts, getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonAnalyticsPage() {
  const { supabase, user } = await getPokemonUser();
  if (!user) redirect("/login");

  const counts = await getPokemonCounts(supabase, user.id);

  const printCompletion = counts.prints ? ((counts.ownedPrints / counts.prints) * 100).toFixed(1) : "0.0";

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">ANALYTICS</div>
          <div className="pkdx-number">{printCompletion}%</div>
        </div>
        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">Collection Insights</div>
              <h1>Analytics</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>
          <p className="pkdx-intro">Pokémon-specific collection, print, variant, and completion analytics.</p>
        </div>
      </section>

      <section className="pkdx-panel">
        <div className="pkdx-stat-grid">
          <div><span>Sets</span><strong>{counts.sets}</strong></div>
          <div><span>Cards</span><strong>{counts.cards}</strong></div>
          <div><span>Prints / Variants</span><strong>{counts.prints}</strong></div>
          <div><span>Owned Prints</span><strong>{counts.ownedPrints}</strong></div>
          <div><span>Wishlist</span><strong>{counts.wishedPrints}</strong></div>
          <div><span>Print Completion</span><strong>{printCompletion}%</strong></div>
        </div>
      </section>
    </main>
  );
}
