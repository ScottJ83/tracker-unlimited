"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PokemonImportClient() {
  const router = useRouter();
  const [limitSets, setLimitSets] = useState(3);
  const [maxCardsPerSet, setMaxCardsPerSet] = useState(80);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function runImport() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/pokemon/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limitSets,
          maxCardsPerSet,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Import failed with status ${response.status}`);
      }

      setResult(data);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pkdx-panel">
      <div className="pkdx-panel-header">
        <div>
          <div className="pkdx-kicker">Alpha Import</div>
          <h2>TCGDex Sample</h2>
        </div>
        <div className="pkdx-mini-dpad"><span /></div>
      </div>

      <div className="pkdx-import-controls">
        <label>
          <span>Sets to import</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limitSets}
            onChange={(event) => setLimitSets(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Max cards per set</span>
          <input
            type="number"
            min={1}
            max={500}
            value={maxCardsPerSet}
            onChange={(event) => setMaxCardsPerSet(Number(event.target.value))}
          />
        </label>

        <button type="button" className="pkdx-button" onClick={runImport} disabled={loading}>
          {loading ? "Importing..." : "Run Import"}
        </button>
      </div>

      <p className="pkdx-panel-text">
        Start small. I recommend keeping this at 3 sets and 80 cards per set for the first test.
      </p>

      {error ? <div className="pkdx-import-error">{error}</div> : null}

      {result ? (
        <pre className="pkdx-import-result">
{JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
