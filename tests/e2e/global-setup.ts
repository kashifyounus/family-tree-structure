import { execSync } from "node:child_process";
import { startEmbeddedDatabase } from "./embedded-db";

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_DB_BOOTSTRAP === "1") {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "PLAYWRIGHT_SKIP_DB_BOOTSTRAP requires DATABASE_URL (CI prepares the database in a prior step).",
      );
    }
    return;
  }

  const url = process.env.DATABASE_URL ?? (await startEmbeddedDatabase());

  process.env.DATABASE_URL = url;
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
  execSync("npm run db:seed", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
