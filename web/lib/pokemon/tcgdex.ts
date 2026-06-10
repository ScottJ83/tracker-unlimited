export const TCGDEX_API_BASE = "https://api.tcgdex.net/v2/en";
export const POKEMON_NATIONAL_TOTAL = 1025;

export type TcgDexSetResume = {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: { total?: number; official?: number };
  releaseDate?: string;
  serie?: { id?: string; name?: string };
};

export async function tcgdexFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TCGDEX_API_BASE}${path}`, {
    next: { revalidate: 60 * 60 * 24 },
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`TCGDex request failed: ${res.status} ${res.statusText} for ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchTcgDexSets() {
  return tcgdexFetch<TcgDexSetResume[]>("/sets");
}

export async function fetchTcgDexSet(id: string) {
  return tcgdexFetch<any>(`/sets/${encodeURIComponent(id)}`);
}

export async function fetchTcgDexCard(id: string) {
  return tcgdexFetch<any>(`/cards/${encodeURIComponent(id)}`);
}

function hasAssetExtension(url: string) {
  return /\.(webp|png|jpg|jpeg)$/i.test(url);
}

export function cardImageUrl(image?: string | null, quality: "low" | "high" = "high") {
  if (!image) return null;
  if (hasAssetExtension(image)) return image;
  return `${image}/${quality}.webp`;
}

export function setAssetUrl(asset?: string | null) {
  if (!asset) return null;
  if (hasAssetExtension(asset)) return asset;
  return `${asset}.webp`;
}

export function slugifyPokemonName(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFirstDexId(card: any) {
  const ids = Array.isArray(card?.dex_ids)
    ? card.dex_ids
    : Array.isArray(card?.dexId)
      ? card.dexId
      : Array.isArray(card?.dexIds)
        ? card.dexIds
        : [];

  const first = Number(ids?.[0]);
  return Number.isFinite(first) ? first : null;
}

export function getVariantMarketPrice(card: any, variantKey: string) {
  const prices = card?.pricing || card?.prices || card?.markets || {};

  const direct =
    prices?.[variantKey]?.market ??
    prices?.[variantKey]?.price ??
    prices?.[variantKey]?.average ??
    prices?.[variantKey]?.low ??
    null;

  if (typeof direct === "number") return direct;

  const tcg = prices?.tcgplayer?.prices || prices?.tcgplayer || {};
  const mapped =
    tcg?.[variantKey]?.market ??
    tcg?.[variantKey]?.mid ??
    tcg?.[variantKey]?.low ??
    null;

  return typeof mapped === "number" ? mapped : null;
}

export function prettyVariantName(key: string) {
  const map: Record<string, string> = {
    normal: "Normal",
    holo: "Holo",
    reverse: "Reverse Holo",
    firstEdition: "1st Edition",
    wPromo: "Wizards Promo",
  };

  return (
    map[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^./, (char) => char.toUpperCase())
      .trim()
  );
}

export function extractPrintsFromCard(card: any) {
  const variants = card?.variants || {};
  const prints: {
    print_key: string;
    print_name: string;
    is_available: boolean;
    price_market?: number | null;
    raw: any;
  }[] = [];

  for (const [key, value] of Object.entries(variants)) {
    const available =
      typeof value === "boolean"
        ? value
        : Boolean((value as any)?.available ?? (value as any)?.exists ?? value);

    if (available) {
      prints.push({
        print_key: key,
        print_name: prettyVariantName(key),
        is_available: true,
        price_market: getVariantMarketPrice(card, key),
        raw: value,
      });
    }
  }

  if (prints.length === 0) {
    prints.push({
      print_key: "standard",
      print_name: "Standard",
      is_available: true,
      price_market: getVariantMarketPrice(card, "standard"),
      raw: {},
    });
  }

  return prints;
}

export const pokemonRegions = [
  { name: "Kanto", slug: "kanto", start: 1, end: 151 },
  { name: "Johto", slug: "johto", start: 152, end: 251 },
  { name: "Hoenn", slug: "hoenn", start: 252, end: 386 },
  { name: "Sinnoh", slug: "sinnoh", start: 387, end: 493 },
  { name: "Unova", slug: "unova", start: 494, end: 649 },
  { name: "Kalos", slug: "kalos", start: 650, end: 721 },
  { name: "Alola", slug: "alola", start: 722, end: 809 },
  { name: "Galar", slug: "galar", start: 810, end: 905 },
  { name: "Paldea", slug: "paldea", start: 906, end: 1025 },
];

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (part / total) * 100));
}

export function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}
