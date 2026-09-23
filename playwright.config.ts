import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const useProductionServer = process.env.PLAYWRIGHT_USE_START === "1";

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    return readFileSync(".playwright-database-url", "utf8").trim();
  } catch {
    return "postgresql://kinship:kinship@localhost:5432/kinship?schema=public";
  }
}

const outputRoot = process.env.CI ? "playwright-output" : "/opt/cursor/artifacts/e2e";

export default defineConfig({
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: `${outputRoot}/playwright-report` }],
  ],
  outputDir: `${outputRoot}/test-results`,
  use: {
    baseURL,
    trace: "on-first-retry",
    video: process.env.CI ? "retain-on-failure" : "on",
    screenshot: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: useProductionServer
      ? `npm run start -- -p ${PORT}`
      : `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT,
      DATABASE_URL: resolveDatabaseUrl(),
    },
  },
});
