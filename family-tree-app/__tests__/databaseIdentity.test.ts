import {
  DEMO_DATABASE_NAME,
  LIVE_DATABASE_NAME,
} from "@/lib/db/database";
import { getDatabaseIdentity } from "@/lib/db/databaseIdentity";

describe("databaseIdentity", () => {
  it("uses separate live and demo sqlite files", () => {
    expect(LIVE_DATABASE_NAME).toBe("kuriosity_live.db");
    expect(DEMO_DATABASE_NAME).toBe("kuriosity_demo.db");
    const identity = getDatabaseIdentity();
    expect(identity.migrationImplemented).toBe(true);
    expect(identity.liveDatabaseName).toBe("kuriosity_live.db");
    expect(identity.demoDatabaseName).toBe("kuriosity_demo.db");
    expect(identity.legacyDatabaseName).toBe("mughals_family.db");
  });
});
