import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchTcgDexCard, fetchTcgDexSet, fetchTcgDexSets } from "@/lib/pokemon/tcgdex";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const sets = await fetchTcgDexSets();
    const base1 = await fetchTcgDexSet("base1");
    const bulbasaur = await fetchTcgDexCard("base1-44");

    return NextResponse.json({
      ok: true,
      totalSets: sets.length,
      firstSet: sets[0],
      base1: {
        id: base1.id,
        name: base1.name,
        cards: Array.isArray(base1.cards) ? base1.cards.length : 0,
        sampleCards: Array.isArray(base1.cards) ? base1.cards.slice(0, 5) : [],
      },
      bulbasaur: {
        id: bulbasaur.id,
        name: bulbasaur.name,
        localId: bulbasaur.localId,
        dexId: bulbasaur.dexId,
        dexIds: bulbasaur.dexIds,
        image: bulbasaur.image,
        variants: bulbasaur.variants,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
