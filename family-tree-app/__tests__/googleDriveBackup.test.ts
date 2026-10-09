import { driveBackupNamesForDate } from "../../shared/backupArtifacts";

describe("googleDriveBackup", () => {
  it("uses kuriosity filenames for Drive uploads", () => {
    expect(driveBackupNamesForDate("2026-10-08")).toEqual({
      sqlite: "kuriosity-family-2026-10-08.db",
      json: "kuriosity-family-2026-10-08.json",
    });
  });
});
