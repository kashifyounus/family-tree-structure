import {
  ACCEPTED_FAMILY_BACKUP_JSON_NAMES,
  defaultJsonExportCachePath,
  driveBackupNamesForDate,
  isAcceptedFamilyBackupJsonFilename,
  KURIOSITY_FAMILY_BACKUP_JSON,
  LEGACY_MUGHALS_FAMILY_BACKUP_JSON,
} from "./backupArtifacts";

describe("backupArtifacts", () => {
  it("accepts kuriosity and legacy export filenames", () => {
    expect(isAcceptedFamilyBackupJsonFilename(KURIOSITY_FAMILY_BACKUP_JSON)).toBe(
      true,
    );
    expect(
      isAcceptedFamilyBackupJsonFilename(LEGACY_MUGHALS_FAMILY_BACKUP_JSON),
    ).toBe(true);
    expect(isAcceptedFamilyBackupJsonFilename("other.json")).toBe(false);
    expect(
      isAcceptedFamilyBackupJsonFilename(`exports/${KURIOSITY_FAMILY_BACKUP_JSON}`),
    ).toBe(true);
  });

  it("names Drive uploads with kuriosity prefix", () => {
    expect(driveBackupNamesForDate("2026-10-08")).toEqual({
      sqlite: "kuriosity-family-2026-10-08.db",
      json: "kuriosity-family-2026-10-08.json",
    });
  });

  it("builds default share path under cache", () => {
    expect(defaultJsonExportCachePath("file:///cache/")).toBe(
      `file:///cache/${KURIOSITY_FAMILY_BACKUP_JSON}`,
    );
  });

  it("lists accepted names for import UI", () => {
    expect(ACCEPTED_FAMILY_BACKUP_JSON_NAMES).toHaveLength(2);
  });
});
