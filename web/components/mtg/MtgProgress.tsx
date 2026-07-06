export default function MtgProgress({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="mtg-progress-card">
      <div className="mtg-progress-top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="mtg-progress-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
