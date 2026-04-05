type Props = {
  label: string;
  value: number;
};

export default function ProgressBar({ label, value }: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  const isBase = label.toLowerCase().includes("base");

  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          marginBottom: "6px",
          display: "flex",
          justifyContent: "space-between",
          color: "#cbd5e1",
          fontSize: "13px",
        }}
      >
        <span>{label}</span>
        <span>{safeValue.toFixed(1)}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#02060c",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            background: isBase ? "#4ea3ff" : "#8b5cf6",
          }}
        />
      </div>
    </div>
  );
}