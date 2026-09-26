import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const appRoot = join(__dirname, "..");
const flowsDir = join(appRoot, "maestro", "flows");

function walkSourceFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walkSourceFiles(path, acc);
    } else if (path.endsWith(".tsx") || path.endsWith(".ts")) {
      acc.push(path);
    }
  }
  return acc;
}

function collectDeclaredTestIds(): Set<string> {
  const ids = new Set<string>();
  const roots = [
    join(appRoot, "app"),
    join(appRoot, "components"),
    join(appRoot, "lib"),
  ];
  const jsxPattern =
    /testID=\{[^}]*["']([a-zA-Z0-9_-]+)["'][^}]*\}|testID=["']([a-zA-Z0-9_-]+)["']/g;
  const defaultParamPattern = /testID\s*=\s*["']([a-zA-Z0-9_-]+)["']/g;
  const submitTestIdPattern = /submitTestID=["']([a-zA-Z0-9_-]+)["']/g;
  const sheetTestIdPattern = /sheetTestID=["']([a-zA-Z0-9_-]+)["']/g;
  const cancelTestIdPattern = /cancelTestID=["']([a-zA-Z0-9_-]+)["']/g;
  const testIdPrefixPattern = /testIdPrefix=["']([a-zA-Z0-9_-]+)["']/g;
  const firstNameTestIdPattern = /firstNameTestID=["']([a-zA-Z0-9_-]+)["']/g;
  const lastNameTestIdPattern = /lastNameTestID=["']([a-zA-Z0-9_-]+)["']/g;
  const stringLiteralIdPattern = /["'](members-first-card|members-row-showcase-margaret-khan)["']/g;

  for (const root of roots) {
    for (const file of walkSourceFiles(root)) {
      const content = readFileSync(file, "utf8");
      for (const match of content.matchAll(jsxPattern)) {
        const id = match[1] ?? match[2];
        if (id) ids.add(id);
      }
      for (const match of content.matchAll(defaultParamPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(submitTestIdPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(sheetTestIdPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(cancelTestIdPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(stringLiteralIdPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(testIdPrefixPattern)) {
        const prefix = match[1];
        ids.add(`${prefix}-create`);
        ids.add(`${prefix}-link`);
      }
      for (const match of content.matchAll(firstNameTestIdPattern)) {
        ids.add(match[1]);
      }
      for (const match of content.matchAll(lastNameTestIdPattern)) {
        ids.add(match[1]);
      }
    }
  }
  return ids;
}

function extractMaestroTestIds(yaml: string): string[] {
  const ids: string[] = [];
  const pattern = /^\s+id:\s*([A-Za-z0-9_-]+)\s*$/gm;
  for (const match of yaml.matchAll(pattern)) {
    ids.push(match[1]);
  }
  return ids;
}

describe("Maestro flow files", () => {
  const declaredIds = collectDeclaredTestIds();

  it("includes smoke flows for onboarding, marriage, backup, and reports", () => {
    expect(existsSync(flowsDir)).toBe(true);
    const files = readdirSync(flowsDir).filter((f: string) => f.endsWith(".yaml"));
    expect(files).toContain("01-onboarding-private-archive.yaml");
    expect(files).toContain("02-add-marriage-spouse.yaml");
    expect(files).toContain("03-tools-backup-export.yaml");
    expect(files).toContain("04-reports-insights.yaml");
    expect(files).toContain("05-complete-family-workflow.yaml");
    expect(files).toContain("06-link-existing-spouse.yaml");
    expect(files).toContain("07-link-existing-child.yaml");
    expect(files).toContain("08-figma-kuriosity-smoke.yaml");
    for (const file of files) {
      const body = readFileSync(join(flowsDir, file), "utf8");
      expect(body).toContain("appId: com.mughals.familytree");
      expect(body).toMatch(/smoke/);
    }
  });

  it("references testIDs that exist in the mobile app", () => {
    const files = readdirSync(flowsDir).filter((f) => f.endsWith(".yaml"));
    const missing: { file: string; id: string }[] = [];

    for (const file of files) {
      const body = readFileSync(join(flowsDir, file), "utf8");
      for (const id of extractMaestroTestIds(body)) {
        if (!declaredIds.has(id)) {
          missing.push({ file, id });
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
