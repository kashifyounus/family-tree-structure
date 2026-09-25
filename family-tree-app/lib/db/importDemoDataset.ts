import { getDatabase } from "@/lib/db/database";
import { uniqueFamilyCode } from "@/lib/db/familyCode";
import type { DemoDataset } from "../../../shared/demoDataset/types";
import { canonicalPartnerIds } from "@/lib/rules/relationshipRules";

export type ImportProgress = { phase: string; percent: number };

export function importDemoDatasetToSqlite(
  dataset: DemoDataset,
  onProgress?: (p: ImportProgress) => void,
): { persons: number; unions: number; children: number; focalFamilyCode: string } {
  const db = getDatabase();
  const now = new Date().toISOString();
  const idToFamilyCode = new Map<string, string>();

  onProgress?.({ phase: "People", percent: 10 });
  db.execSync("BEGIN TRANSACTION");
  try {
    for (let i = 0; i < dataset.persons.length; i++) {
      const p = dataset.persons[i]!;
      const familyCode = uniqueFamilyCode();
      idToFamilyCode.set(p.id, familyCode);
      db.runSync(
        `INSERT INTO persons (
          id, family_code, first_name, last_name, gender, birth_date, death_date,
          current_city, privacy_level, is_fixture, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBERS_ONLY', 1, ?, ?)`,
        [
          p.id,
          familyCode,
          p.firstName,
          p.lastName,
          p.gender,
          p.birthDate,
          p.deathDate,
          p.currentCity,
          now,
          now,
        ],
      );
      if (i % 400 === 0) {
        onProgress?.({
          phase: "People",
          percent: 10 + Math.floor((i / dataset.persons.length) * 55),
        });
      }
    }

    onProgress?.({ phase: "Marriages", percent: 70 });
    for (const u of dataset.unions) {
      const [p1, p2] = canonicalPartnerIds(u.partner1Id, u.partner2Id);
      db.runSync(
        `INSERT INTO unions (id, partner_1_id, partner_2_id, marriage_date, divorce_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, p1, p2, u.marriageDate, u.divorceDate, u.isActive ? 1 : 0],
      );
    }

    onProgress?.({ phase: "Children", percent: 85 });
    for (const c of dataset.children) {
      db.runSync(
        `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, ?)`,
        [c.id, c.unionId, c.childId, c.relationshipType],
      );
    }

    db.execSync("COMMIT");
  } catch (error) {
    db.execSync("ROLLBACK");
    throw error;
  }

  const focalFamilyCode =
    idToFamilyCode.get(dataset.focalPersonId) ??
    db.getFirstSync<{ family_code: string }>(
      "SELECT family_code FROM persons WHERE id = ?",
      [dataset.focalPersonId],
    )?.family_code ??
    "FAM-10000";

  onProgress?.({ phase: "Done", percent: 100 });

  return {
    persons: dataset.persons.length,
    unions: dataset.unions.length,
    children: dataset.children.length,
    focalFamilyCode,
  };
}
