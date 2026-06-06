import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Reads ./data/*.json from SWU-DB.
// Existing cards: update ONLY cards.price.
// Missing cards: insert full card rows.
// User collection data is never touched.

const SET_NAME_MAP = {
  LAW: "A Lawless Time",
  LAWOP: "A Lawless Time Organized Play",
  LAWP: "A Lawless Time Organized Play",
  SEC: "Secrets of Power",
  SECOP: "Secrets of Power Organized Play",
  JTL: "Jump to Lightspeed",
  JTLOP: "Jump to Lightspeed Organized Play",
  SOR: "Spark of Rebellion",
  SOROP: "Spark of Rebellion Organized Play",
  SOROPJ: "Spark of Rebellion Organized Play Judge",
  ESOR: "Spark of Rebellion Event Exclusives",
  PSOR: "Spark of Rebellion Prerelease Promos",
  TSOR: "Spark of Rebellion Tokens",
  LOF: "Legends of the Force",
  LOFOP: "Legends of the Force Organized Play",
  SHD: "Shadows of the Galaxy",
  SHDOP: "Shadows of the Galaxy Organized Play",
  PSHD: "Shadows of the Galaxy Prerelease Promos",
  TWI: "Twilight of the Republic",
  TWIOP: "Twilight of the Republic Organized Play",
  PTWI: "Twilight of the Republic Prerelease Promos",
  IBH: "Intro Battle: Hoth",
  TS26: "Twin Suns 2026",
  C24: "2024 Convention Exclusives",
  C25: "2025 Convention Exclusives",
  G25: "2025 Gift Box",
  GG: "Gamegenic",
  J24: "2024 Judge Promos",
  J25: "2025 Judge Promos",
  P25: "2025 Promos",
  P26: "2026 Promos",
  ASH: "Ashes of the Empire",
  SS1: "Store Showdown 1",
  SS1J: "Store Showdown 1 Judge",
  SS2: "Store Showdown 2",
  SS2J: "Store Showdown 2 Judge",
};

const SET_CODE_ALIASES = {
  LAWP: "LAWOP",
};

const AUTO_OP_FOIL_SETS = new Set(["SHDOP", "SOROP", "TWIOP"]);

function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s === "-" ? null : s;
}

function toInt(v) {
  const s = String(v ?? "").replace(/[^\d]/g, "");
  return s ? parseInt(s, 10) : null;
}

function toNum(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function normalizeList(v) {
  if (Array.isArray(v)) return v.join("|");
  return clean(v)?.replace(/,\s*/g, "|") ?? null;
}

function mapSetCode(v) {
  const raw = String(v || "").trim().toUpperCase();
  return SET_CODE_ALIASES[raw] || raw;
}

function mapVariant(v) {
  const x = String(v || "").trim().toLowerCase();

  if (x === "normal") return "Standard";
  if (x === "standard") return "Standard";
  if (x === "foil") return "Standard Foil";
  if (x === "standard foil") return "Standard Foil";
  if (x === "hyperspace") return "Hyperspace";
  if (x === "hyperspace foil") return "Hyperspace Foil";
  if (x === "showcase") return "Showcase";
  if (x === "prestige") return "Prestige";
  if (x === "prestige foil") return "Prestige Foil";
  if (x === "prestige serialized") return "Prestige Serialized";
  if (x === "standard prestige") return "Standard Prestige";
  if (x === "foil prestige") return "Foil Prestige";
  if (x === "serialized prestige") return "Serialized Prestige";
  if (x === "weekly play") return "OP Promo";
  if (x === "weekly play foil") return "OP Promo Foil";
  if (x === "op promo") return "OP Promo";
  if (x === "op promo foil") return "OP Promo Foil";

  return String(v || "").trim();
}

function bestPrice(row, variantOverride = null, priceOverride = null) {
  if (priceOverride !== null && priceOverride !== undefined) return priceOverride;

  const variant = variantOverride || mapVariant(row.VariantType ?? row.variantType ?? row.variant_type ?? row.Variant ?? row.variant);
  const market = toNum(row.MarketPrice ?? row.marketPrice ?? row.market_price);
  const foil = toNum(row.FoilPrice ?? row.foilPrice ?? row.foil_price);
  const low = toNum(row.LowPrice ?? row.lowPrice ?? row.low_price);
  const lowFoil = toNum(row.LowFoilPrice ?? row.lowFoilPrice ?? row.low_foil_price);

  if (market !== null) return market;
  if (variant.toLowerCase().includes("foil") && foil !== null) return foil;
  if (variant.toLowerCase().includes("foil") && lowFoil !== null) return lowFoil;
  if (low !== null) return low;

  return null;
}

function makeCardRow(row, variantOverride = null, priceOverride = null) {
  const set_code = mapSetCode(row.Set ?? row.set ?? row.setCode ?? row.set_code);
  const name = clean(row.Name ?? row.name);
  const subtitle = clean(row.Subtitle ?? row.subtitle);
  const variant = variantOverride ?? mapVariant(row.VariantType ?? row.variantType ?? row.variant_type ?? row.Variant ?? row.variant);
  const card_number = toInt(row.Number ?? row.number ?? row.cardNumber ?? row.card_number ?? row.collector_number);

  if (!set_code || !name || !variant || card_number === null) return null;

  return {
    set_code,
    name,
    subtitle,
    variant,
    card_number,
    aspect: normalizeList(row.Aspects ?? row.aspects ?? row.Aspect ?? row.aspect),
    traits: normalizeList(row.Traits ?? row.traits ?? row.Trait ?? row.trait),
    arena: normalizeList(row.Arenas ?? row.arenas ?? row.Arena ?? row.arena),
    card_type: clean(row.Type ?? row.type),
    rarity: clean(row.Rarity ?? row.rarity),
    cost: toInt(row.Cost ?? row.cost),
    power: toInt(row.Power ?? row.power),
    hp: toInt(row.HP ?? row.hp),
    price: bestPrice(row, variant, priceOverride),
    front_text: clean(row.FrontText ?? row.frontText ?? row.front_text ?? row.Text ?? row.text),
    artist: clean(row.Artist ?? row.artist),
    front_art: clean(row.FrontArt ?? row.frontArt ?? row.front_image_url ?? row.frontImageUrl),
  };
}

function readJsonFiles() {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Missing data folder: ${dataDir}`);
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.toLowerCase().endsWith(".json"));

  let rows = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) continue;

    const parsed = JSON.parse(raw);
    const fileRows = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.data)
        ? parsed.data
        : Array.isArray(parsed.cards)
          ? parsed.cards
          : [];

    console.log(`${file}: ${fileRows.length} rows`);
    rows = rows.concat(fileRows.map((row) => ({ ...row, __sourceFile: file })));
  }

  return rows;
}

async function getExistingCardKeys() {
  const existing = new Set();
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("set_code,card_number,variant")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      existing.add(`${row.set_code}|${row.card_number}|${row.variant}`);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return existing;
}

async function upsertSets(cards) {
  const setCodes = Array.from(new Set(cards.map((card) => card.set_code))).filter(Boolean);

  const rows = setCodes.map((code) => ({
    code,
    name: SET_NAME_MAP[code] || code,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("sets")
    .upsert(rows, {
      onConflict: "code",
      ignoreDuplicates: false,
    });

  if (error) throw error;

  console.log(`Sets upserted: ${rows.length}`);
}

async function insertMissingCards(rows) {
  const chunkSize = 500;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize).filter(
      (card) => card.name && card.set_code && card.variant && card.card_number !== null
    );

    if (chunk.length === 0) continue;

    const { error } = await supabase
      .from("cards")
      .upsert(chunk, {
        onConflict: "set_code,card_number,variant",
        ignoreDuplicates: true,
      });

    if (error) throw error;

    console.log(`Missing cards inserted: ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
  }
}

async function updatePricesOneByOne(rows) {
  let updated = 0;
  let skipped = 0;

  for (const card of rows) {
    if (card.price === null || card.price === undefined) {
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from("cards")
      .update({ price: card.price })
      .eq("set_code", card.set_code)
      .eq("card_number", card.card_number)
      .eq("variant", card.variant);

    if (error) throw error;

    updated++;
    if (updated % 500 === 0) {
      console.log(`Prices refreshed: ${updated} / ${rows.length}`);
    }
  }

  console.log(`Prices refreshed: ${updated} / ${rows.length}`);
  if (skipped > 0) console.log(`Price rows skipped because price was blank: ${skipped}`);
}

async function run() {
  const rawRows = readJsonFiles();

  let allParsedCards = [];
  let invalidRows = [];

  for (const row of rawRows) {
    const card = makeCardRow(row);
    if (!card) {
      invalidRows.push({
        file: row.__sourceFile,
        set: row.Set ?? row.set ?? row.setCode ?? row.set_code,
        number: row.Number ?? row.number ?? row.cardNumber ?? row.card_number,
        name: row.Name ?? row.name,
        variant: row.VariantType ?? row.variantType ?? row.variant_type ?? row.Variant ?? row.variant,
      });
      continue;
    }

    allParsedCards.push(card);

    if (AUTO_OP_FOIL_SETS.has(card.set_code) && card.variant === "OP Promo") {
      const foilPrice = toNum(row.FoilPrice ?? row.foilPrice ?? row.foil_price);
      if (foilPrice !== null) {
        const foilCard = makeCardRow(row, "OP Promo Foil", foilPrice);
        if (foilCard) allParsedCards.push(foilCard);
      }
    }
  }

  if (invalidRows.length > 0) {
    fs.writeFileSync("invalid_import_rows.json", JSON.stringify(invalidRows, null, 2));
    console.log(`Skipped invalid rows: ${invalidRows.length} (saved to invalid_import_rows.json)`);
  }

  const dedupedCards = Array.from(
    new Map(
      allParsedCards.map((card) => [
        `${card.set_code}|${card.card_number}|${card.variant}`,
        card,
      ])
    ).values()
  );

  console.log(`Parsed unique cards: ${dedupedCards.length}`);

  await upsertSets(dedupedCards);

  const existingKeys = await getExistingCardKeys();

  const priceUpdates = [];
  const inserts = [];

  for (const card of dedupedCards) {
    const key = `${card.set_code}|${card.card_number}|${card.variant}`;

    if (existingKeys.has(key)) {
      priceUpdates.push(card);
    } else {
      inserts.push(card);
    }
  }

  console.log(`Existing cards to price-refresh: ${priceUpdates.length}`);
  console.log(`Missing cards to insert: ${inserts.length}`);

  if (priceUpdates.length > 0) {
    await updatePricesOneByOne(priceUpdates);
  }

  if (inserts.length > 0) {
    await insertMissingCards(inserts);
  }

  console.log("Done. User collection data was not modified.");
}

run().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});
