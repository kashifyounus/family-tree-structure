import * as SecureStore from "expo-secure-store";

import { getDatabase } from "@/lib/db/database";

const SESSION_KEY = "mughals_local_account_id";

/** Wipes all private-archive SQLite rows for a fresh start (manual + sample). */
export function resetPrivateArchiveDatabase(): void {
  const db = getDatabase();
  db.execSync("PRAGMA foreign_keys = OFF");
  db.execSync("DELETE FROM children");
  db.execSync("DELETE FROM unions");
  db.execSync("DELETE FROM local_accounts");
  db.execSync("DELETE FROM persons");
  db.execSync("PRAGMA foreign_keys = ON");
}

export async function resetPrivateArchiveAndSignOut(): Promise<void> {
  resetPrivateArchiveDatabase();
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
