import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SETS = ["LAW", "SEC", "JTL", "SOR", "LOF", "SHD", "TWI", "IBH"];

function norm(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(v) {
  const s = String(v || "").trim();
  return s === "" || s === "-" ? null : s;
}

function first(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return "";
}

function mapVariant(v) {
  const x = norm(v);

  if (x === "original") return "Standard";
  if (x === "foil") return "Standard Foil";
  if (x === "hyperspace") return "Hyperspace";
  if (x === "hyperspace foil") return "Hyperspace Foil";
  if (x === "showcase") return "Showcase";
  if (x === "standard prestige") return "Standard Prestige";
  if (x === "foil prestige") return "Foil Prestige";
  if (x === "serialized prestige") return "Serialized Prestige";

  return String(v || "").trim();
}

function normalizeAspect(v) {
  return clean(v)?.replace(/,\s*/g, "|") ?? null;
}

async function getDbCardsForSet(setCode) {
  let all = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id,set_code,name,subtitle,variant")
      .eq("set_code", setCode)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function fetchSetCsv(setCode) {
  const url = `https://api.swu-db.com/cards/${setCode.toLowerCase()}?format=csv`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${setCode}: ${res.status}`);
  }

  const text = await res.text();
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
  });
}

function buildIndex(rows) {
  const map = new Map();

  for (const row of rows) {
    const key = [
      norm(row.set_code),
      norm(row.name),
      norm(row.subtitle),
      norm(row.variant),
    ].join("|||");

    map.set(key, row);
  }

  return map;
}

async function run() {
  for (const setCode of SETS) {
    console.log(`\n=== ${setCode} ===`);

    const dbRows = await getDbCardsForSet(setCode);
    const apiRows = await fetchSetCsv(setCode);
    const dbIndex = buildIndex(dbRows);

    let matched = 0;
    let updated = 0;

    for (const row of apiRows) {
      const name = clean(first(row, ["Name", "name"]));
      const subtitle = clean(first(row, ["Subtitle", "subtitle"]));
      const variantRaw = clean(first(row, ["Variant", "variant"]));
      const variant = mapVariant(variantRaw);

      const key = [
        norm(setCode),
        norm(name),
        norm(subtitle),
        norm(variant),
      ].join("|||");

      const dbRow = dbIndex.get(key);
      if (!dbRow) continue;

      matched++;

      const card_number = clean(first(row, ["Number", "number", "SetNumber", "setnumber"]));
      const aspect = normalizeAspect(first(row, ["Aspects", "aspects", "Aspect", "aspect"]));
      const arena = clean(first(row, ["Arenas", "arenas", "Arena", "arena"]));
      const card_type = clean(first(row, ["Type", "type"]));
      const rarity = clean(first(row, ["Rarity", "rarity"]));

      const { error } = await supabase
        .from("cards")
        .update({
          card_number: card_number ? parseInt(String(card_number).replace(/[^\d]/g, ""), 10) : null,
          aspect,
          arena,
          card_type,
          rarity,
        })
        .eq("id", dbRow.id);

      if (error) {
        console.log("FAILED:", setCode, name, variant, error.message);
      } else {
        updated++;
      }
    }

    console.log(`MATCHED: ${matched}`);
    console.log(`UPDATED: ${updated}`);
  }

  console.log("Done");
}

run().catch((e) => {
  console.error("FATAL:", e);
});