import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function csv(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function run() {
  let allCards = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("set_code,name,subtitle,variant,card_number,aspect,arena,card_type,rarity")
      .order("set_code")
      .order("name")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(error);
      return;
    }

    if (!data || data.length === 0) break;

    allCards = [...allCards, ...data];
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const lines = [];
  lines.push("set_code,name,subtitle,variant,card_number,aspect,arena,card_type,rarity");

  for (const card of allCards) {
    lines.push([
      csv(card.set_code),
      csv(card.name),
      csv(card.subtitle || ""),
      csv(card.variant),
      csv(card.card_number || ""),
      csv(card.aspect || ""),
      csv(card.arena || ""),
      csv(card.card_type || ""),
      csv(card.rarity || ""),
    ].join(","));
  }

  fs.writeFileSync("swu_metadata_template.csv", lines.join("\n"));
  console.log("Done: swu_metadata_template.csv");
}

run();