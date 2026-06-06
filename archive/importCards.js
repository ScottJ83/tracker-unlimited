import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const lines = fs.readFileSync("SWU_Cards.txt", "utf-8").split("\n");

const cards = [];

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;

  const parts = line.split(",");

  if (parts.length < 5) continue;

  parts.pop(); // MarketPrice: ...
  const set_code = parts.pop()?.trim() || "";
  const variant = parts.pop()?.trim() || "";

  parts.shift(); // quantity, ignore

  const name = parts.shift()?.trim() || "";
  const subtitle = parts.join(",").trim() || null;

  if (!name || !set_code || !variant) continue;

  cards.push({
    name,
    subtitle,
    variant,
    set_code,
  });
}

async function insertCards() {
  const chunkSize = 500;

  for (let i = 0; i < cards.length; i += chunkSize) {
    const chunk = cards.slice(i, i + chunkSize);

    const { error } = await supabase.from("cards").insert(chunk);

    if (error) {
      console.error("Insert failed on chunk:", i / chunkSize + 1, error);
      return;
    }

    console.log(`Inserted ${Math.min(i + chunkSize, cards.length)} / ${cards.length}`);
  }

  console.log("Done:", cards.length);
}

insertCards();