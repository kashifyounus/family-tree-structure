import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const flowsDir = join(__dirname, "..", "maestro", "flows");

describe("Maestro flow files", () => {
  it("includes smoke flows for onboarding, marriage, backup, and reports", () => {
    expect(existsSync(flowsDir)).toBe(true);
    const files = readdirSync(flowsDir).filter((f: string) => f.endsWith(".yaml"));
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
