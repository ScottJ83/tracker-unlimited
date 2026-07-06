import "../mtg.css";
import { getMtgSets, getMtgUser } from "@/lib/mtg/queries";
import MtgSetTile from "@/components/mtg/MtgSetTile";

export default async function MtgSetsPage() {
  const { supabase, user } = await getMtgUser();
  const sets = await getMtgSets(supabase, user?.id);
  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero"><p className="mtg-kicker">Archive Resources</p><h1>Sets</h1><p>Browse every imported MTG set and track print completion.</p></section>
        <section className="mtg-panel"><div className="mtg-card-grid">{sets.map((set: any) => <MtgSetTile key={set.id} set={set} />)}</div></section>
      </div>
    </main>
  );
}
