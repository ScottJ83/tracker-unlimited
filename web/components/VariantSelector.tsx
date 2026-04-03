"use client";

type Variant = {
  id: string;
  name: string;
};

type Props = {
  variants: Variant[];
  value: string;
  onChange: (v: string) => void;
};

export default function VariantSelector({ variants, value, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {variants.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  );
}