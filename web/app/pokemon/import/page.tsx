import { redirect } from "next/navigation";
import PokemonImportClient from "@/components/pokemon/PokemonImportClient";
import { getPokemonUser } from "@/lib/pokemon/queries";

export const dynamic = "force-dynamic";

export default async function PokemonImportPage() {
  const { user } = await getPokemonUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="pkdx-page">
      <section className="pkdx-device pkdx-device-small">
        <div className="pkdx-topbar">
          <div className="pkdx-lens"><span /></div>
          <div className="pkdx-title-pill">IMPORT</div>
          <div className="pkdx-number">TCG</div>
        </div>

        <div className="pkdx-screen">
          <div className="pkdx-screen-header">
            <div>
              <div className="pkdx-kicker">TCGDex Import Tool</div>
              <h1>Import</h1>
            </div>
            <div className="pkdx-status-light" />
          </div>

          <p className="pkdx-intro">
            Run a small authenticated import directly from your browser. This uses your current login session, unlike PowerShell.
          </p>
        </div>
      </section>

      <PokemonImportClient />
    </main>
  );
}
