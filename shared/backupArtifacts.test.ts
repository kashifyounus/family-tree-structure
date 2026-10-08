import {
  driveBackupNamesForDate,
  isAcceptedFamilyBackupJsonFilename,
  kuriosityDriveJsonBackupName,
  kuriosityDriveSqliteBackupName,
} from "./backupArtifacts";

describe("backupArtifacts", () => {
  it("accepts kuriosity and legacy mughals export filenames", () => {
    expect(isAcceptedFamilyBackupJsonFilename("kuriosity-family-backup.json")).toBe(
      true,
    );
    expect(isAcceptedFamilyBackupJsonFilename("mughals-family-backup.json")).toBe(
      true,
    );
    expect(isAcceptedFamilyBackupJsonFilename("other.json")).toBe(false);
  });

  it("names Drive uploads with kuriosity prefix", () => {
    expect(kuriosityDriveSqliteBackupName("2026-10-08")).toBe(
      "kuriosity-family-2026-10-08.db",
    );
    expect(kuriosityDriveJsonBackupName("2026-10-08")).toBe(
      "kuriosity-family-2026-10-08.json",
    );
    expect(driveBackupNamesForDate("2026-10-08").sqlite).toContain(".db");
  });
});
