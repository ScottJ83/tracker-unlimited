import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const EXPANSION_IDS = {
  LAW: "53",
  SEC: "23",
  JTL: "25",
  SOR: "2",
  LOF: "18",
  SHD: "8",
  TWI: "9",
  IBH: "27",
};

function clean(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAllCardsFromDb() {
  let all = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id,set_code,name,subtitle,variant")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function acceptCookies(page) {
  const labels = [/accept/i, /agree/i, /allow/i, /ok/i];
  for (const label of labels) {
    try {
      const btn = page.getByRole("button", { name: label });
      if ((await btn.count()) > 0) {
        await btn.first().click({ timeout: 2000 });
        await page.waitForTimeout(1000);
        return;
      }
    } catch {}
  }
}

function parseMainMetadata(text) {
  const numberMatch = text.match(/Card Number\s*([0-9]+)/i);
  const arenaMatch = text.match(/Arena\s*([A-Za-z]+)/i);
  const rarityMatch = text.match(/Rarity\s*([A-Za-z ]+)/i);
  const typeMatch = text.match(/Type\s*([A-Za-z /-]+)/i);
  const aspectMatch = text.match(/Aspect\(s\)\s*([A-Za-z, ]+)/i);

  return {
    card_number: numberMatch ? Number(numberMatch[1]) : null,
    arena: arenaMatch ? clean(arenaMatch[1]) : null,
    rarity: rarityMatch ? clean(rarityMatch[1]) : null,
    card_type: typeMatch ? clean(typeMatch[1]) : null,
    aspect: aspectMatch ? clean(aspectMatch[1].replace(/,\s*/g, "|")) : null,
  };
}

function parseVariantNumbers(text, setCode) {
  const out = {};

  const patterns = [
    { key: "Standard", re: new RegExp(`${setCode}\\s*#(\\d+)\\s+Original`, "i") },
    { key: "Standard Foil", re: new RegExp(`${setCode}\\s*#(\\d+)F\\s+Foil`, "i") },
    { key: "Hyperspace", re: new RegExp(`${setCode}\\s*#(\\d+)\\s+Hyperspace`, "i") },
    { key: "Hyperspace Foil", re: new RegExp(`${setCode}\\s*#(\\d+)F\\s+Hyperspace Foil`, "i") },
  ];

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) out[p.key] = Number(m[1]);
  }

  return out;
}

async function updateRow(id, meta) {
  const { error } = await supabase
    .from("cards")
    .update({
      card_number: meta.card_number ?? null,
      aspect: clean(meta.aspect),
      arena: clean(meta.arena),
      card_type: clean(meta.card_type),
      rarity: clean(meta.rarity),
    })
    .eq("id", id);

  if (error) console.log("FAILED:", id, error.message);
}

async function run() {
  const allCards = await getAllCardsFromDb();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const groups = new Map();

  for (const row of allCards) {
    if (!EXPANSION_IDS[row.set_code]) continue;
    const key = `${row.set_code}|||${normalize(row.name)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  for (const [key, rows] of groups.entries()) {
    const setCode = rows[0].set_code;
    const name = rows[0].name;
    const expansion = EXPANSION_IDS[setCode];

    const url =
      `https://starwarsunlimited.com/cards?searchTerm=${encodeURIComponent(name)}` +
      `&expansion=${expansion}`;

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await acceptCookies(page);
      await page.waitForTimeout(2500);

      const text = await page.locator("body").innerText();
      const mainMeta = parseMainMetadata(text);
      const variantNumbers = parseVariantNumbers(text, setCode);

      console.log(`PROCESSING: ${setCode} | ${name}`);
      console.log("VARIANT NUMBERS:", variantNumbers);

      for (const row of rows) {
        const meta = { ...mainMeta };

        if (variantNumbers[row.variant]) {
          meta.card_number = variantNumbers[row.variant];
        }

        await updateRow(row.id, meta);
      }
    } catch (e) {
      console.log("SCRAPE FAILED:", setCode, name, e.message);
    }
  }

  await context.close();
  await browser.close();
  console.log("Done");
}

run().catch((e) => console.error("FATAL:", e));