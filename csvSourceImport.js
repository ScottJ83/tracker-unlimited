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

const SETS = ["LAW", "SEC", "JTL", "SOR", "LOF", "SHD", "TWI", "IBH"];

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
  return s === "" ? null : Number(s);
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
      const name = clean(row.Name ?? row.name);
      const subtitle = clean(row.Subtitle ?? row.subtitle);
      const variant = mapVariant(row.VariantType ?? row.variantType ?? row.Variant ?? row.variant);
      const card_number = toInt(row.Number ?? row.number);
      const aspect = normalizeList(row.Aspects ?? row.aspects ?? row.Aspect ?? row.aspect);
      const arena = normalizeList(row.Arenas ?? row.arenas ?? row.Arena ?? row.arena);
      const card_type = clean(row.Type ?? row.type);
      const rarity = clean(row.Rarity ?? row.rarity);
      const price = toNum(row.MarketPrice ?? row.marketPrice);

      if (!name || !variant) continue;

      allCards.push({
        set_code: setCode,
        name,
        subtitle,
        variant,
        card_number,
        aspect,
        arena,
        card_type,
        rarity,
        price,
      });
    }
  }

  const chunkSize = 500;

  for (let i = 0; i < allCards.length; i += chunkSize) {
    const chunk = allCards.slice(i, i + chunkSize);

    const { error } = await supabase.from("cards").insert(chunk);

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }

    console.log(`Inserted ${Math.min(i + chunkSize, allCards.length)} / ${allCards.length}`);
  }

  console.log("Done:", allCards.length);
}

run();