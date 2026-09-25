#!/usr/bin/env node
/**
 * Renders HD PNG mockups (1170×2532 per screen) from docs/ui-samples/hd-mockup-export.html
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const HTML = join(ROOT, "docs/ui-samples/hd-mockup-export.html");
const OUT = join(ROOT, "docs/ui-samples/hd");
const ARTIFACTS = "/opt/cursor/artifacts/hd-mockups";

const IDS = [
  "mockup-onboarding",
  "mockup-home",
  "mockup-tree",
  "mockup-members",
  "mockup-sheet",
  "mockup-account",
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(ARTIFACTS, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 3,
  });

  await page.goto(`file://${HTML}`, { waitUntil: "networkidle" });

  for (const id of IDS) {
    const el = page.locator(`#${id}`);
    const name = id.replace("mockup-", "kuriosity-hd-") + ".png";
    const pathOut = join(OUT, name);
    const pathArt = join(ARTIFACTS, name);
    await el.screenshot({ path: pathOut, type: "png" });
    await el.screenshot({ path: pathArt, type: "png" });
    console.log(`Wrote ${pathOut}`);
  }

  await page.screenshot({
    path: join(OUT, "kuriosity-hd-all-screens.png"),
    fullPage: true,
    type: "png",
  });
  await page.screenshot({
    path: join(ARTIFACTS, "kuriosity-hd-all-screens.png"),
    fullPage: true,
    type: "png",
  });
  console.log(`Wrote combined board to ${OUT}/kuriosity-hd-all-screens.png`);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
