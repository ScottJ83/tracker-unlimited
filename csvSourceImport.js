import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SETS = [
  "LAW",
  "SEC",
  "SECOP",
  "JTL",
  "JTLOP",
  "SOR",
  "SOROP",
  "LOF",
  "LOFOP",
  "SHD",
  "SHDOP",
  "TWI",
  "TWIOP",
  "IBH",
];
function clean(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s === "-" ? null : s;
}

function mapVariant(v) {
  const x = String(v || "").trim().toLowerCase();

  if (x === "normal") return "Standard";
  if (x === "foil") return "Standard Foil";
  if (x === "hyperspace") return "Hyperspace";
  if (x === "hyperspace foil") return "Hyperspace Foil";
  if (x === "showcase") return "Showcase";
  if (x === "standard prestige") return "Standard Prestige";
  if (x === "foil prestige") return "Foil Prestige";
  if (x === "serialized prestige") return "Serialized Prestige";

  return String(v || "").trim();
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

function loadRows(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").trim();

  if (raw.startsWith("{") || raw.startsWith("[")) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.cards)) return parsed.cards;
    if (Array.isArray(parsed.data)) return parsed.data;
    return [];
  }

  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    cast: true,
  });
}

function makeCardRow(row, setCode, variantOverride = null, priceOverride = null) {
  const name = clean(row.Name ?? row.name);
  const subtitle = clean(row.Subtitle ?? row.subtitle);
  const variant = variantOverride ?? mapVariant(row.VariantType ?? row.variantType ?? row.Variant ?? row.variant);
  const card_number = toInt(row.Number ?? row.number);
  const aspect = normalizeList(row.Aspects ?? row.aspects ?? row.Aspect ?? row.aspect);
  const traits = normalizeList(row.Traits ?? row.traits ?? row.Trait ?? row.trait);
  const arena = normalizeList(row.Arenas ?? row.arenas ?? row.Arena ?? row.arena);
  const card_type = clean(row.Type ?? row.type);
  const rarity = clean(row.Rarity ?? row.rarity);
  const cost = toInt(row.Cost ?? row.cost);
  const power = toInt(row.Power ?? row.power);
  const hp = toInt(row.HP ?? row.hp);
  const price = priceOverride ?? toNum(row.MarketPrice ?? row.marketPrice);
  const front_text = clean(row.FrontText ?? row.frontText);
  const artist = clean(row.Artist ?? row.artist);
  const front_art = clean(row.FrontArt ?? row.frontArt);

  if (setCode === "SHD" && card_number === 87) {
    console.log("DEBUG SHD 087 PARSED:", {
      traits,
      cost,
      power,
      hp,
    });
  }

  if (!name || !variant) return null;

  return {
    set_code: setCode,
    name,
    subtitle,
    variant,
    card_number,
    aspect,
    traits,
    arena,
    card_type,
    rarity,
    cost,
    power,
    hp,
    price,
    front_text,
    artist,
    front_art,
  };
}

async function run() {
  let allCards = [];

  for (const setCode of SETS) {
const filePath = path.join("data", `${setCode}.csv`);
if (!fs.existsSync(filePath)) {
  console.log(`Missing file: ${filePath}`);
  continue;
}

    const rows = loadRows(filePath);

    for (const row of rows) {
      if (setCode === "SHD" && String(row.Number ?? row.number) === "087") {
        console.log("DEBUG SHD 087 RAW ROW:", row);
      }

      const baseCard = makeCardRow(row, setCode);
      if (!baseCard) continue;

      allCards.push(baseCard);

      const originalVariant = mapVariant(row.VariantType ?? row.variantType ?? row.Variant ?? row.variant);
      const foilPrice = toNum(row.FoilPrice ?? row.foilPrice);

      if (setCode !== "IBH" && originalVariant === "Standard" && foilPrice !== null) {
        allCards.push(makeCardRow(row, setCode, "Standard Foil", foilPrice));
      }

      if (setCode !== "IBH" && originalVariant === "Hyperspace" && foilPrice !== null) {
        allCards.push(makeCardRow(row, setCode, "Hyperspace Foil", foilPrice));
      }
    }
  }

  const deduped = Array.from(
    new Map(
      allCards.map((card) => [
        `${card.set_code}|${card.card_number}|${card.variant}`,
        card,
      ])
    ).values()
  );

  const chunkSize = 500;

  for (let i = 0; i < deduped.length; i += chunkSize) {
    const chunk = deduped.slice(i, i + chunkSize);

    const { error } = await supabase
      .from("cards")
      .upsert(chunk, {
        onConflict: "set_code,card_number,variant",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Upsert failed:", error.message);
      return;
    }

    console.log(`Upserted ${Math.min(i + chunkSize, deduped.length)} / ${deduped.length}`);
  }

  console.log("Done:", deduped.length);
}

run();