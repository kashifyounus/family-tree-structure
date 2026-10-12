#!/usr/bin/env node
/**
 * Renders PNG mockups from the production pedigree canvas (see tree-live-mockup-board.html).
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const HTML = join(ROOT, "docs/ui-samples/tree-live-mockup-board.html");
const OUT = join(ROOT, "docs/ui-samples/hd");
const ARTIFACTS = "/opt/cursor/artifacts/family-tree-mockups";

const IDS = ["mockup-curated-default", "mockup-curated-partial"];

function main() {
  const gen = spawnSync(
    "npm",
    ["test", "--", "__tests__/exportTreeLiveMockups.test.ts"],
    {
      cwd: join(ROOT, "family-tree-app"),
      stdio: "inherit",
      env: { ...process.env, EXPORT_TREE_MOCKUP: "1" },
    },
  );
  if (gen.status !== 0) process.exit(gen.status ?? 1);

  mkdirSync(OUT, { recursive: true });
  mkdirSync(ARTIFACTS, { recursive: true });

  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 3,
    });
    await page.goto(`file://${HTML}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    for (const id of IDS) {
      const name = `kuriosity-tree-live-${id.replace("mockup-", "")}.png`;
      await page.locator(`#${id}`).screenshot({
        path: join(OUT, name),
        type: "png",
      });
      await page.locator(`#${id}`).screenshot({
        path: join(ARTIFACTS, name),
        type: "png",
      });
      console.log(`Wrote ${join(ARTIFACTS, name)}`);
    }

    await page.screenshot({
      path: join(OUT, "kuriosity-tree-live-board.png"),
      fullPage: true,
      type: "png",
    });
    await page.screenshot({
      path: join(ARTIFACTS, "kuriosity-tree-live-board.png"),
      fullPage: true,
      type: "png",
    });
    console.log(`Wrote ${join(ARTIFACTS, "kuriosity-tree-live-board.png")}`);

    await browser.close();
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

main();
