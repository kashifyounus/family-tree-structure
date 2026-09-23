import { execSync } from "node:child_process";
import { startEmbeddedDatabase } from "./embedded-db";

export default async function globalSetup() {
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
