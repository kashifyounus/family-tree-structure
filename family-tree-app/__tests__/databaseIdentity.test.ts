import { DB_NAME } from "@/lib/db/database";
import {
  ACTIVE_DATABASE_NAME,
  getDatabaseIdentity,
  PLANNED_KURIOSITY_DATABASE_NAME,
} from "@/lib/db/databaseIdentity";

describe("databaseIdentity", () => {
  it("keeps legacy active name until migration ships", () => {
    expect(ACTIVE_DATABASE_NAME).toBe(DB_NAME);
    expect(ACTIVE_DATABASE_NAME).toBe("mughals_family.db");
    const identity = getDatabaseIdentity();
    expect(identity.migrationImplemented).toBe(false);
    expect(identity.plannedDatabaseName).toBe(PLANNED_KURIOSITY_DATABASE_NAME);
  });
});
