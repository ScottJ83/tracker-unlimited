"use client";

export default function HideMissingToggle({ value, onChange }: any) {
  return (
    <label style={{ display: "block", marginBottom: "10px" }}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      Hide Missing Cards
    </label>
  );
}