import { getDatabase } from "@/lib/db/database";
import { deleteLocalMember } from "@/lib/db/localRepository";
import { importDemoDatasetToSqlite } from "@/lib/db/importDemoDataset";
import { buildHugeDemoDataset } from "../../../shared/demoDataset/buildHugeDemoDataset";

export const DEFAULT_FIXTURE_TARGET_PERSONS = 2500;

export function countFixturePeople(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM persons WHERE is_fixture = 1",
  );
  return row?.count ?? 0;
}

/** Removes fixture rows only; local accounts and non-fixture people stay. */
export function wipeFixtureDataset(): { removed: number } {
  const db = getDatabase();
  const keepRows = db.getAllSync<{ focal_person_id: string }>(
    "SELECT focal_person_id FROM local_accounts",
  );
  const keep = new Set(keepRows.map((r) => r.focal_person_id));
  const fixtureIds = db.getAllSync<{ id: string }>(
    "SELECT id FROM persons WHERE is_fixture = 1",
  );
  let removed = 0;
  for (const { id } of fixtureIds) {
    if (keep.has(id)) continue;
    deleteLocalMember(id);
    removed += 1;
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
