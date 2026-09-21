import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const flowsDir = join(__dirname, "..", "maestro", "flows");

describe("Maestro flow files", () => {
  it("includes smoke flows for onboarding, marriage, backup, and reports", () => {
    const files = readdirSync(flowsDir).filter((f) => f.endsWith(".yaml"));
    expect(files).toContain("01-onboarding-private-archive.yaml");
    expect(files).toContain("02-add-marriage-spouse.yaml");
    expect(files).toContain("03-tools-backup-export.yaml");
    expect(files).toContain("04-reports-insights.yaml");
    for (const file of files) {
      const body = readFileSync(join(flowsDir, file), "utf8");
      expect(body).toContain("appId: com.mughals.familytree");
      expect(body).toMatch(/smoke/);
    }
  });
});
