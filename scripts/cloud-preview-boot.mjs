#!/usr/bin/env node
/**
 * Starts embedded Postgres, runs migrations + seed for cloud preview / manual testing.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const DB_NAME = "kinship";
const DB_USER = "kinship";
const DB_PASSWORD = "kinship";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL_FILE = join(ROOT, ".cloud-database-url");

const dataDir = join(tmpdir(), "kuriosity-pg-cloud-preview");
mkdirSync(dataDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: DB_USER,
  password: DB_PASSWORD,
  port: 5432,
  persistent: true,
});

console.log("[cloud-preview] Starting embedded PostgreSQL…");
await pg.initialise();
await pg.start();
try {
  await pg.createDatabase(DB_NAME);
} catch {
  // already exists
}

const url = `postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?schema=public`;
writeFileSync(URL_FILE, url, "utf8");
process.env.DATABASE_URL = url;

console.log("[cloud-preview] DATABASE_URL written to", URL_FILE);
execSync("npx prisma migrate deploy", { cwd: ROOT, stdio: "inherit", env: process.env });
execSync("npm run db:seed", { cwd: ROOT, stdio: "inherit", env: process.env });
console.log("[cloud-preview] Database ready.");

// Keep process alive so Postgres stays up when imported as module — when run directly, exit after boot.
if (process.argv.includes("--stay")) {
  console.log("[cloud-preview] Postgres running (PID", process.pid, ")");
  setInterval(() => {}, 60_000);
}
