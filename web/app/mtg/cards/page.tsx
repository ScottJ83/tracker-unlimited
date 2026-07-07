import "../mtg.css";
import { getMtgRecentCards, getMtgUser } from "@/lib/mtg/queries";
import MtgCardsGalleryClient from "@/components/mtg/MtgCardsGalleryClient";

export const dynamic = "force-dynamic";

export default async function MtgCardsPage() {
  const { supabase, user } = await getMtgUser();
  const cards = await getMtgRecentCards(supabase, user?.id, 120);

  return (
    <main className="mtg-page">
      <div className="mtg-shell">
        <section className="mtg-hero">
          <p className="mtg-kicker">Spell Archive</p>
          <h1>Cards</h1>
          <p>Browse imported MTG printings using the same owned/missing checklist behavior as the rest of Tracker Unlimited.</p>
        </section>
        <MtgCardsGalleryClient cards={cards} />
      </div>
    </main>
  );
}
