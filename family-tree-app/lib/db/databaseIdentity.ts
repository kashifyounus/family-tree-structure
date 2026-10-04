import {
  DEMO_DATABASE_NAME,
  getActiveDatabaseFileName,
  LIVE_DATABASE_NAME,
} from "@/lib/db/database";
import { LEGACY_DATABASE_NAME } from "@/lib/db/legacyDatabaseMigration";

export const ACTIVE_DATABASE_NAME = getActiveDatabaseFileName();
export const LEGACY_DATABASE_FILE = LEGACY_DATABASE_NAME;

export type DatabaseIdentity = {
  activeDatabaseName: string;
  liveDatabaseName: string;
  demoDatabaseName: string;
  legacyDatabaseName: string;
  migrationImplemented: boolean;
};

export function getDatabaseIdentity(): DatabaseIdentity {
  return {
    activeDatabaseName: getActiveDatabaseFileName(),
    liveDatabaseName: LIVE_DATABASE_NAME,
    demoDatabaseName: DEMO_DATABASE_NAME,
    legacyDatabaseName: LEGACY_DATABASE_FILE,
    migrationImplemented: true,
  };
}

export { LIVE_DATABASE_NAME, DEMO_DATABASE_NAME };
