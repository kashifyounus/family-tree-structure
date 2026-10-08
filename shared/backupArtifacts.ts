/** Portable backup naming (U1 migration — keep legacy aliases for import). */

export const KURIOSITY_FAMILY_BACKUP_JSON = "kuriosity-family-backup.json";
export const LEGACY_MUGHALS_FAMILY_BACKUP_JSON = "mughals-family-backup.json";

export const ACCEPTED_FAMILY_BACKUP_JSON_NAMES = [
  KURIOSITY_FAMILY_BACKUP_JSON,
  LEGACY_MUGHALS_FAMILY_BACKUP_JSON,
] as const;

export function isAcceptedFamilyBackupJsonFilename(name: string): boolean {
  const base = name.trim().split("/").pop() ?? name;
  return ACCEPTED_FAMILY_BACKUP_JSON_NAMES.includes(
    base as (typeof ACCEPTED_FAMILY_BACKUP_JSON_NAMES)[number],
  );
}

export function kuriosityDriveSqliteBackupName(isoDate: string): string {
  return `kuriosity-family-${isoDate}.db`;
}

export function kuriosityDriveJsonBackupName(isoDate: string): string {
  return `kuriosity-family-${isoDate}.json`;
}

export function defaultJsonExportCachePath(cacheDirectory: string): string {
  return `${cacheDirectory}${KURIOSITY_FAMILY_BACKUP_JSON}`;
}

export function driveBackupNamesForDate(isoDate: string): {
  sqlite: string;
  json: string;
} {
  return {
    sqlite: kuriosityDriveSqliteBackupName(isoDate),
    json: kuriosityDriveJsonBackupName(isoDate),
  };
}
