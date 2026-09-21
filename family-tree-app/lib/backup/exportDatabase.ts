import { copyAsync, cacheDirectory } from "expo-file-system/legacy";
import { defaultDatabaseDirectory } from "expo-sqlite";

import { AppError } from "@/lib/errors/AppError";
import { DB_NAME } from "@/lib/db/database";

/** Copies the on-device SQLite file to cache for upload or sharing. */
export async function copyDatabaseToCache(): Promise<string> {
  const source = `${defaultDatabaseDirectory}/${DB_NAME}`;
  const dest = `${cacheDirectory}mughals_family_${Date.now()}.db`;
  try {
    await copyAsync({ from: source, to: dest });
    return dest;
  } catch (cause) {
    throw new AppError("BACKUP", "Could not prepare database backup.", { cause });
  }
}
