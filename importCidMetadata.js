import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function clean(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" || s === "-" ? null : s;
}

async function getRowsWithCid() {
  let all = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id,set_code,name,subtitle,variant,cid")
      .not("cid", "is", null)
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

function parseMeta(text) {
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

async function run() {
  const rows = await getRowsWithCid();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const row of rows) {
    try {
      const url = `https://starwarsunlimited.com/cards?cid=${row.cid}`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await acceptCookies(page);
      await page.waitForTimeout(2500);

      const text = await page.locator("body").innerText();
      const meta = parseMeta(text);

      const { error } = await supabase
        .from("cards")
        .update({
          card_number: meta.card_number,
          aspect: meta.aspect,
          arena: meta.arena,
          card_type: meta.card_type,
          rarity: meta.rarity,
        })
        .eq("id", row.id);

      if (error) {
        console.log("FAILED:", row.name, row.variant, row.cid, error.message);
      } else {
        console.log("UPDATED:", row.name, row.variant, row.cid, meta.card_number);
      }
    } catch (e) {
      console.log("SCRAPE FAILED:", row.name, row.variant, row.cid, e.message);
    }
  }

  await context.close();
  await browser.close();
  console.log("Done");
}

run().catch((e) => console.error("FATAL:", e));