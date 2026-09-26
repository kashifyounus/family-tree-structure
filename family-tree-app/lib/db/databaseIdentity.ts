import { DB_NAME } from "@/lib/db/database";
import {
  KURIOSITY_DATABASE_NAME,
  LEGACY_DATABASE_NAME,
} from "@/lib/db/legacyDatabaseMigration";

export const ACTIVE_DATABASE_NAME = DB_NAME;
export const LEGACY_DATABASE_FILE = LEGACY_DATABASE_NAME;

export type DatabaseIdentity = {
  activeDatabaseName: string;
  legacyDatabaseName: string;
  migrationImplemented: boolean;
};

export function getDatabaseIdentity(): DatabaseIdentity {
  return {
    activeDatabaseName: ACTIVE_DATABASE_NAME,
    legacyDatabaseName: LEGACY_DATABASE_FILE,
    migrationImplemented: true,
  };
}

export { KURIOSITY_DATABASE_NAME };
