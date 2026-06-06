import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((v) => v.trim());
}

const fileName = "swu_metadata.csv";
const lines = fs.readFileSync(fileName, "utf-8").split("\n").filter(Boolean);
const headers = parseCsvLine(lines[0]);

async function run() {
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? ""]));

    const set_code = row.set_code || null;
    const name = row.name || null;
    const subtitle = row.subtitle || null;
    const variant = row.variant || null;

    if (!set_code || !name || !variant) continue;

    let query = supabase
      .from("cards")
      .update({
        card_number: row.card_number ? Number(row.card_number) : null,
        aspect: row.aspect || null,
        arena: row.arena || null,
        card_type: row.card_type || null,
        rarity: row.rarity || null,
      })
      .eq("set_code", set_code)
      .eq("name", name)
      .eq("variant", variant);

    if (subtitle) {
      query = query.eq("subtitle", subtitle);
    } else {
      query = query.is("subtitle", null);
    }

    const { error } = await query;

    if (error) {
      console.log("FAILED:", set_code, name, variant, error.message);
    }
  }

  console.log("Done");
}

run();