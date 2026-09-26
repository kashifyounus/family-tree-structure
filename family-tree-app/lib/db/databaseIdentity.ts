import { DB_NAME } from "@/lib/db/database";

/** Production SQLite filename (legacy Mughal prefix — do not rename without migration). */
export const ACTIVE_DATABASE_NAME = DB_NAME;

/**
 * Reserved for a future one-time file copy migration.
 * Not used by `getDatabase()` until `docs/SQLITE_MIGRATION_PLAN.md` is implemented.
 */
export const PLANNED_KURIOSITY_DATABASE_NAME = "kuriosity_family.db";

export type DatabaseIdentity = {
  activeDatabaseName: string;
  plannedDatabaseName: string;
  migrationImplemented: boolean;
};

export function getDatabaseIdentity(): DatabaseIdentity {
  return {
    activeDatabaseName: ACTIVE_DATABASE_NAME,
    plannedDatabaseName: PLANNED_KURIOSITY_DATABASE_NAME,
    migrationImplemented: false,
  };
}
