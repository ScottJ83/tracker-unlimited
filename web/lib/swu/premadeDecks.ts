export type PremadeDeckEntry = {
  code: string;
  quantity: number;
};

export type PremadeDeck = {
  slug: string;
  name: string;
  productType: "Spotlight Deck" | "Twin Suns Deck" | "Starter Deck";
  game: "Star Wars Unlimited";
  description: string;
  entries: PremadeDeckEntry[];
};

function entry(line: string): PremadeDeckEntry {
  const match = line.trim().match(/^(\d+)x([A-Z0-9]+_\d+)$/);

  if (!match) {
    throw new Error(`Invalid premade deck entry: ${line}`);
  }

  return {
    quantity: Number(match[1]),
    code: match[2],
  };
}

export const premadeDecks: PremadeDeck[] = [
  {
    slug: "padme-amidala-spotlight",
    name: "Padmé Amidala",
    productType: "Spotlight Deck",
    game: "Star Wars Unlimited",
    description:
      "Track your collection progress toward the official Padmé Amidala pre-made deck. Cards remain visible even when missing, with missing cards grayed out until they are in your collection.",
    entries: [
      "2xSEC_120",
      "2xSEC_129",
      "1xSEC_103",
      "2xLOF_198",
      "1xLOF_100",
      "1xSEC_99",
      "3xSEC_201",
      "1xSEC_16",
      "1xSEC_127",
      "2xJTL_123",
      "1xSEC_208",
      "1xSEC_111",
      "2xSEC_94",
      "2xSEC_234",
      "2xSEC_198",
      "2xLOF_192",
      "1xJTL_111",
      "3xSEC_98",
      "1xSEC_106",
      "1xSEC_93",
      "1xSEC_22",
      "3xSEC_96",
      "2xSEC_116",
      "3xSEC_197",
      "3xLOF_194",
      "1xSEC_256",
      "3xSEC_226",
      "2xSEC_199",
      "1xSEC_248",
      "1xSEC_115",
    ].map(entry),
  },
];

export function getPremadeDeck(slug: string) {
  return premadeDecks.find((deck) => deck.slug === slug) || null;
}

export function parseCardCode(code: string) {
  const [setCode, rawNumber] = code.split("_");

  return {
    code,
    setCode,
    cardNumber: rawNumber,
    paddedCardNumber: rawNumber?.padStart(3, "0"),
  };
}

export function getDeckTotalCards(deck: PremadeDeck) {
  return deck.entries.reduce((sum, entry) => sum + entry.quantity, 0);
}
