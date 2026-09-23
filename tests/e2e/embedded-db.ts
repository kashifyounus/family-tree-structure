import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const DB_NAME = "kinship";
const DB_USER = "kinship";
const DB_PASSWORD = "kinship";
const URL_FILE = join(process.cwd(), ".playwright-database-url");

let instance: EmbeddedPostgres | null = null;

export async function startEmbeddedDatabase(): Promise<string> {
  const dataDir = join(tmpdir(), `mughals-pg-${process.pid}`);
  mkdirSync(dataDir, { recursive: true });

  instance = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: DB_USER,
    password: DB_PASSWORD,
    port: 5432,
    persistent: false,
  });

  await instance.initialise();
  await instance.start();
  await instance.createDatabase(DB_NAME);

  const url = `postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?schema=public`;
  process.env.DATABASE_URL = url;
  writeFileSync(URL_FILE, url, "utf8");
  return url;
}

export async function stopEmbeddedDatabase(): Promise<void> {
  if (!instance) return;
  await instance.stop();
  instance = null;
}

export function databaseUrlFromFile(): string | undefined {
  try {
    return readFileSync(URL_FILE, "utf8").trim();
  } catch {
    return process.env.DATABASE_URL;
  }
}
