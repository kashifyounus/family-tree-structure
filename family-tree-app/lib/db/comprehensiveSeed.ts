import { getDatabase } from "@/lib/db/database";
import { deleteLocalMember } from "@/lib/db/localRepository";
import { importDemoDatasetToSqlite } from "@/lib/db/importDemoDataset";
import { buildCuratedPedigreeDemo } from "../../../shared/demoDataset/buildCuratedPedigreeDemo";
import { buildHugeDemoDataset } from "../../../shared/demoDataset/buildHugeDemoDataset";

export const DEFAULT_FIXTURE_TARGET_PERSONS = 2500;

export function countFixturePeople(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM persons WHERE is_fixture = 1",
  );
  return row?.count ?? 0;
}

/** Removes fixture rows only; manually created (non-fixture) people and accounts stay. */
export function wipeFixtureDataset(): { removed: number } {
  const db = getDatabase();
  const fixtureIds = db.getAllSync<{ id: string }>(
    "SELECT id FROM persons WHERE is_fixture = 1",
  );
  const deletedIds = new Set<string>();
  let removed = 0;
  for (const { id } of fixtureIds) {
    deleteLocalMember(id);
    deletedIds.add(id);
    removed += 1;
  }

  const accounts = db.getAllSync<{ id: string; focal_person_id: string }>(
    "SELECT id, focal_person_id FROM local_accounts",
  );
  for (const acct of accounts) {
    if (!deletedIds.has(acct.focal_person_id)) continue;
    const replacement = db.getFirstSync<{ id: string; family_code: string }>(
      "SELECT id, family_code FROM persons WHERE is_fixture = 0 ORDER BY created_at ASC LIMIT 1",
    );
    if (replacement) {
      db.runSync(
        "UPDATE local_accounts SET focal_person_id = ?, focal_family_code = ? WHERE id = ?",
        [replacement.id, replacement.family_code, acct.id],
      );
    } else {
      db.runSync("DELETE FROM local_accounts WHERE id = ?", [acct.id]);
    }
  }

  return { removed };
}

export type SeedProgress = { phase: string; percent: number };

export type SeedFixtureOptions = {
  targetPersons?: number;
  seed?: number;
};

/**
 * Generates a large unique-name demo tree (names, ages, gender, cities, mixed relationships)
 * and imports it into local SQLite as fixture data.
 */
/** Curated Hassan–Khan pedigree (all tree-map relations) marked `is_fixture`. */
export function seedCuratedPedigreeFixture(
  onProgress?: (p: SeedProgress) => void,
): ReturnType<typeof importDemoDatasetToSqlite> & {
  stats: ReturnType<typeof buildCuratedPedigreeDemo>["stats"];
} {
  wipeFixtureDataset();
  onProgress?.({ phase: "Preparing sample family", percent: 5 });
  const dataset = buildCuratedPedigreeDemo();
  onProgress?.({ phase: "Importing", percent: 20 });
  const result = importDemoDatasetToSqlite(dataset, onProgress);
  return { ...result, stats: dataset.stats };
}

export function seedComprehensiveFixture(
  onProgress?: (p: SeedProgress) => void,
  options: SeedFixtureOptions = {},
): {
  persons: number;
  unions: number;
  children: number;
  focalFamilyCode: string;
  stats: ReturnType<typeof buildHugeDemoDataset>["stats"];
} {
  wipeFixtureDataset();
  onProgress?.({ phase: "Generating", percent: 2 });

  const dataset = buildHugeDemoDataset({
    targetPersons: options.targetPersons ?? DEFAULT_FIXTURE_TARGET_PERSONS,
    seed: options.seed,
  });

  onProgress?.({ phase: "Importing", percent: 8 });
  const result = importDemoDatasetToSqlite(dataset, onProgress);

  return { ...result, stats: dataset.stats };
}

/** Serializable bundle for export / server import. */
export function buildFixtureExportBundle(options: SeedFixtureOptions = {}) {
  return buildHugeDemoDataset({
    targetPersons: options.targetPersons ?? DEFAULT_FIXTURE_TARGET_PERSONS,
    seed: options.seed,
  });
}
