import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  execSync("npm run db:seed", { stdio: "inherit" });
}
