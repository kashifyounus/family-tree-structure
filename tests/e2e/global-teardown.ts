import { stopEmbeddedDatabase } from "./embedded-db";

export default async function globalTeardown() {
  await stopEmbeddedDatabase();
}
