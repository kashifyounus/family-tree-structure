import { DB_NAME } from "@/lib/db/database";
import {
  ACTIVE_DATABASE_NAME,
  getDatabaseIdentity,
  KURIOSITY_DATABASE_NAME,
} from "@/lib/db/databaseIdentity";

describe("databaseIdentity", () => {
  it("uses kuriosity database filename with migration enabled", () => {
    expect(ACTIVE_DATABASE_NAME).toBe(DB_NAME);
    expect(ACTIVE_DATABASE_NAME).toBe(KURIOSITY_DATABASE_NAME);
    expect(ACTIVE_DATABASE_NAME).toBe("kuriosity_family.db");
    const identity = getDatabaseIdentity();
    expect(identity.migrationImplemented).toBe(true);
    expect(identity.legacyDatabaseName).toBe("mughals_family.db");
  });
});
