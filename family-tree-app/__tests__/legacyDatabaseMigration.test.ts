import { chooseLegacyMigrationAction } from "@/lib/db/legacyDatabaseMigration";

describe("chooseLegacyMigrationAction", () => {
  it("does nothing when legacy file is absent", () => {
    expect(
      chooseLegacyMigrationAction({
        legacyFileExists: false,
        kuriosityFileExists: false,
        legacyPersonCount: 0,
      }),
    ).toBe("none");
  });

  it("drops empty legacy when kuriosity already exists", () => {
    expect(
      chooseLegacyMigrationAction({
        legacyFileExists: true,
        kuriosityFileExists: true,
        legacyPersonCount: 5,
      }),
    ).toBe("drop_legacy");
  });

  it("copies legacy data when kuriosity is missing", () => {
    expect(
      chooseLegacyMigrationAction({
        legacyFileExists: true,
        kuriosityFileExists: false,
        legacyPersonCount: 2,
      }),
    ).toBe("copy_to_kuriosity_then_drop_legacy");
  });

  it("drops empty legacy when kuriosity is missing", () => {
    expect(
      chooseLegacyMigrationAction({
        legacyFileExists: true,
        kuriosityFileExists: false,
        legacyPersonCount: 0,
      }),
    ).toBe("drop_legacy");
  });
});
