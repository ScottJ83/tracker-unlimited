type Props = {
  label: string;
  value: number;
};

export default function ProgressBar({ label, value }: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  const isBase = label.toLowerCase().includes("base");

  return (
    <div className="progress-row">
      <div className="progress-top">
        <span>{label}</span>
        <span>{safeValue.toFixed(1)}%</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${safeValue}%`,
            background: isBase
              ? "linear-gradient(90deg, #5c9fff 0%, #7dc8ff 100%)"
              : "linear-gradient(90deg, #8d78ff 0%, #d2a1ff 100%)",
          }}
        />
      </div>
    </div>
  );
}