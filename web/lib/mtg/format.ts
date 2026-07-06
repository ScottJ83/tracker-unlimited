export const MTG_ARCHIVE_TOTAL_LABEL = "Every spell. Every printing. Every plane.";

export function normalizeMtgName(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function percent(owned: number, total: number) {
  if (!total) return 0;
  return Math.round((owned / total) * 1000) / 10;
}

export function usd(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}
