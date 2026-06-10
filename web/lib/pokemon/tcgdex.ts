export const TCGDEX_API_BASE = "https://api.tcgdex.net/v2/en";

export type TcgDexSetResume = {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    total?: number;
    official?: number;
  };
  releaseDate?: string;
  serie?: {
    id?: string;
    name?: string;
  };
};

export type TcgDexCardResume = {
  id: string;
  localId?: string;
  name: string;
  image?: string;
};

export async function tcgdexFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TCGDEX_API_BASE}${path}`, {
    next: { revalidate: 60 * 60 * 24 },
    headers: {
      accept: "application/json",
    },
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

export function imageUrl(image?: string | null) {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${image}/high.webp`;
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
        print_name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase())
          .trim(),
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
