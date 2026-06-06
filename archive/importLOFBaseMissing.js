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

function makeCardRow(row) {
  const name = clean(row.name ?? row.Name);
  const subtitle = clean(row.subtitle ?? row.Subtitle);

  const variant = mapVariant(
    row.variant_type ??
      row.VariantType ??
      row.variant ??
      row.Variant
  );

  const card_number = toInt(
    row.card_number ??
      row.Number ??
      row.number ??
      row.collector_number
  );

  const aspect = normalizeList(row.aspects ?? row.Aspects);
  const traits = normalizeList(row.traits ?? row.Traits);
  const arena = normalizeList(row.arenas ?? row.Arenas);

  const card_type = clean(row.type ?? row.Type);
  const rarity = clean(row.rarity ?? row.Rarity);

  const cost = toInt(row.cost ?? row.Cost);
  const power = toInt(row.power ?? row.Power);
  const hp = toInt(row.hp ?? row.HP);

  const price = toNum(row.market_price ?? row.MarketPrice);

  const front_text = clean(row.front_text ?? row.FrontText);
  const artist = clean(row.artist ?? row.Artist);
  const front_art = clean(row.front_image_url ?? row.FrontArt);

  if (!name || !variant || !card_number) return null;

  return {
    set_code: "LOF",
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
  const filePath = path.join("data", "LOFBase.csv");

  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${filePath}`);
    return;
  }

  const rows = loadRows(filePath);
  const cards = rows.map(makeCardRow).filter(Boolean);

  if (cards.length === 0) {
    console.log("No valid rows found.");
    return;
  }

  const chunkSize = 500;

  for (let i = 0; i < cards.length; i += chunkSize) {
    const chunk = cards.slice(i, i + chunkSize);

    const { error } = await supabase
      .from("cards")
      .upsert(chunk, {
        onConflict: "set_code,card_number,variant",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Import failed:", error.message);
      return;
    }

    console.log(`Processed ${Math.min(i + chunkSize, cards.length)} / ${cards.length}`);
  }

  console.log("Done");
}

run();