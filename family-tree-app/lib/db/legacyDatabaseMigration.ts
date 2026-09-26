import { getInfoAsync } from "expo-file-system/legacy";
import {
  backupDatabaseSync,
  deleteDatabaseSync,
  defaultDatabaseDirectory,
  openDatabaseSync,
  type SQLiteDatabase,
} from "expo-sqlite";

export const LEGACY_DATABASE_NAME = "mughals_family.db";
export const KURIOSITY_DATABASE_NAME = "kuriosity_family.db";

export type LegacyMigrationAction =
  | "none"
  | "drop_legacy"
  | "copy_to_kuriosity_then_drop_legacy";

export function chooseLegacyMigrationAction(input: {
  legacyFileExists: boolean;
  kuriosityFileExists: boolean;
  legacyPersonCount: number;
}): LegacyMigrationAction {
  if (!input.legacyFileExists) return "none";
  if (input.kuriosityFileExists) return "drop_legacy";
  if (input.legacyPersonCount > 0) return "copy_to_kuriosity_then_drop_legacy";
  return "drop_legacy";
}

function countPersons(db: SQLiteDatabase): number {
  try {
    const row = db.getFirstSync<{ n: number }>("SELECT COUNT(*) as n FROM persons");
    return Number(row?.n ?? 0);
  } catch {
    return 0;
  }
}

/**
 * One-time move from `mughals_family.db` → `kuriosity_family.db` (file copy when data exists).
 */
export async function migrateLegacyDatabaseIfNeeded(): Promise<void> {
  const legacyPath = `${defaultDatabaseDirectory}/${LEGACY_DATABASE_NAME}`;
  const kuriosityPath = `${defaultDatabaseDirectory}/${KURIOSITY_DATABASE_NAME}`;
  const [legacyInfo, kuriosityInfo] = await Promise.all([
    getInfoAsync(legacyPath),
    getInfoAsync(kuriosityPath),
  ]);

  if (!legacyInfo.exists) return;

  let legacyPersonCount = 0;
  if (!kuriosityInfo.exists) {
    const probe = openDatabaseSync(LEGACY_DATABASE_NAME);
    legacyPersonCount = countPersons(probe);
    probe.closeSync();
  }

  const action = chooseLegacyMigrationAction({
    legacyFileExists: true,
    kuriosityFileExists: kuriosityInfo.exists,
    legacyPersonCount,
  });

  if (action === "none") return;

  if (action === "drop_legacy") {
    try {
      deleteDatabaseSync(LEGACY_DATABASE_NAME);
    } catch {
      // ignore missing legacy file
    }
    return;
  }

  const legacyDb = openDatabaseSync(LEGACY_DATABASE_NAME);
  try {
    const kuriosityDb = openDatabaseSync(KURIOSITY_DATABASE_NAME);
    backupDatabaseSync({
      sourceDatabase: legacyDb,
      destDatabase: kuriosityDb,
    });
    kuriosityDb.closeSync();
  } finally {
    legacyDb.closeSync();
    try {
      deleteDatabaseSync(LEGACY_DATABASE_NAME);
    } catch {
      // ignore
    }
  }
}
