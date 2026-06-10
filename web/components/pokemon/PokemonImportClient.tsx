"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  ok: boolean;
  offsetSets: number;
  limitSets: number;
  totalSets: number;
  nextOffset: number;
  done: boolean;
  setsImported: number;
  cardsImported: number;
  printsImported: number;
  errors: any[];
};

export default function PokemonImportClient() {
  const router = useRouter();
  const [offsetSets, setOffsetSets] = useState(0);
  const [limitSets, setLimitSets] = useState(2);
  const [maxCardsPerSet, setMaxCardsPerSet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoImporting, setAutoImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [log, setLog] = useState<ImportResult[]>([]);
  const [error, setError] = useState("");

  async function runBatch(customOffset = offsetSets) {
    const response = await fetch("/api/pokemon/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offsetSets: customOffset,
        limitSets,
        maxCardsPerSet,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `Import failed with status ${response.status}`);
    }

    setResult(data);
    setLog((current) => [data, ...current].slice(0, 20));
    setOffsetSets(data.nextOffset || 0);
    router.refresh();

    return data as ImportResult;
  }

  async function runSingleImport() {
    setLoading(true);
    setError("");

    try {
      await runBatch(offsetSets);
    } catch (err: any) {
      setError(err?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  async function runFullImport() {
    setAutoImporting(true);
    setLoading(true);
    setError("");

    try {
      let currentOffset = offsetSets;

      while (true) {
        const data = await runBatch(currentOffset);
        if (data.done) break;
        currentOffset = data.nextOffset;
      }
    } catch (err: any) {
      setError(err?.message || "Full import stopped.");
    } finally {
      setAutoImporting(false);
      setLoading(false);
    }
  }

  const totalSets = result?.totalSets || 0;
  const importedThrough = result?.nextOffset ?? offsetSets;
  const progress = totalSets ? Math.min(100, Math.round((importedThrough / totalSets) * 100)) : 0;

  return (
    <section className="pkdx-panel">
      <div className="pkdx-panel-header">
        <div>
          <div className="pkdx-kicker">Alpha Import</div>
          <h2>TCGDex Full Import</h2>
        </div>
        <div className="pkdx-mini-dpad"><span /></div>
      </div>

      <div className="pkdx-import-controls">
        <label>
          <span>Start set offset</span>
          <input
            type="number"
            min={0}
            value={offsetSets}
            onChange={(event) => setOffsetSets(Number(event.target.value))}
            disabled={loading}
          />
        </label>

        <label>
          <span>Sets per batch</span>
          <input
            type="number"
            min={1}
            max={10}
            value={limitSets}
            onChange={(event) => setLimitSets(Number(event.target.value))}
            disabled={loading}
          />
        </label>

        <label>
          <span>Max cards per set</span>
          <input
            type="number"
            min={0}
            value={maxCardsPerSet}
            onChange={(event) => setMaxCardsPerSet(Number(event.target.value))}
            disabled={loading}
          />
        </label>

        <button type="button" className="pkdx-button" onClick={runSingleImport} disabled={loading}>
          {loading && !autoImporting ? "Importing..." : "Import Next Batch"}
        </button>

        <button
          type="button"
          className="pkdx-button pkdx-button-white"
          onClick={runFullImport}
          disabled={loading}
        >
          {autoImporting ? "Importing All..." : "Import All From Offset"}
        </button>
      </div>

      <p className="pkdx-panel-text">
        Set <strong>Max cards per set</strong> to <strong>0</strong> to import every card from each set.
        Keep <strong>Sets per batch</strong> at 2 or 3 if Vercel times out.
      </p>

      {totalSets ? (
        <div className="pkdx-import-progress">
          <div>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {importedThrough} / {totalSets} sets processed ({progress}%)
          </p>
        </div>
      ) : null}

      {error ? <div className="pkdx-import-error">{error}</div> : null}

      {result ? (
        <pre className="pkdx-import-result">
{JSON.stringify(result, null, 2)}
        </pre>
      ) : null}

      {log.length ? (
        <div className="pkdx-import-log">
          <h3>Recent Batches</h3>
          {log.map((item, index) => (
            <div key={`${item.offsetSets}-${index}`}>
              Sets {item.offsetSets}–{item.nextOffset - 1}: {item.setsImported} sets,{" "}
              {item.cardsImported} cards, {item.printsImported} prints
              {item.errors?.length ? `, ${item.errors.length} errors` : ""}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
