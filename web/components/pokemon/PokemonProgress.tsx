export default function PokemonProgress({
  label,
  value,
  total,
  percent,
}: {
  label: string;
  value: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="pkdx-progress-card">
      <div className="pkdx-progress-top">
        <span>{label}</span>
        <strong>{percent.toFixed(1)}%</strong>
      </div>
      <div className="pkdx-progress-bar">
        <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
      <p>
        {value.toLocaleString()} / {total.toLocaleString()}
      </p>
    </div>
  );
}
