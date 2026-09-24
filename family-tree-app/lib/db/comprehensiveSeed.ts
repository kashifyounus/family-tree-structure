import { getDatabase } from "@/lib/db/database";
import { uniqueFamilyCode } from "@/lib/db/familyCode";
import { deleteLocalMember } from "@/lib/db/localRepository";
import type { Gender } from "@/lib/data/types";
import { canonicalPartnerIds } from "@/lib/rules/relationshipRules";

const MALE_NAMES = [
  "Hassan", "Ali", "Omar", "Bilal", "Usman", "Hamza", "Zain", "Imran", "Kamran", "Faisal",
];
const FEMALE_NAMES = [
  "Ayesha", "Fatima", "Zainab", "Hira", "Sana", "Nadia", "Rabia", "Maryam", "Sadia", "Amna",
];
const SURNAMES = [
  "Khan", "Malik", "Sheikh", "Qureshi", "Abbasi", "Mirza", "Chaudhry", "Butt", "Raza", "Hussain",
];

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `fx-${Date.now()}-${Math.random()}`;
}

function insertFixturePerson(
  firstName: string,
  lastName: string,
  gender: Gender,
  birthYear: number,
): string {
  const db = getDatabase();
  const id = newId();
  const now = new Date().toISOString();
  const birthDate = `${birthYear}-06-15`;
  db.runSync(
    `INSERT INTO persons (
      id, family_code, first_name, last_name, gender, birth_date,
      privacy_level, is_fixture, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'MEMBERS_ONLY', 1, ?, ?)`,
    [id, uniqueFamilyCode(), firstName, lastName, gender, birthDate, now, now],
  );
  return id;
}

function insertUnion(partner1Id: string, partner2Id: string, marriageYear: number): string {
  const db = getDatabase();
  const unionId = newId();
  const [p1, p2] = canonicalPartnerIds(partner1Id, partner2Id);
  db.runSync(
    `INSERT INTO unions (id, partner_1_id, partner_2_id, marriage_date, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [unionId, p1, p2, `${marriageYear}-01-01`],
  );
  return unionId;
}

function linkChild(unionId: string, childId: string): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, 'BIOLOGICAL')`,
    [newId(), unionId, childId],
  );
}

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

/**
 * Builds 500+ people with marriages, children, step-sibling unions, and cousin links.
 */
export function seedComprehensiveFixture(
  onProgress?: (p: SeedProgress) => void,
): { persons: number; unions: number; children: number; focalFamilyCode: string } {
  wipeFixtureDataset();
  onProgress?.({ phase: "Founders", percent: 5 });

  const db = getDatabase();
  db.execSync("BEGIN TRANSACTION");
  try {
    let unions = 0;
    let childrenLinks = 0;
    const generation: string[] = [];

    for (let i = 0; i < 12; i++) {
      const last = SURNAMES[i % SURNAMES.length];
      const male = insertFixturePerson(MALE_NAMES[i % MALE_NAMES.length], last, "MALE", 1940 + i);
      const female = insertFixturePerson(FEMALE_NAMES[i % FEMALE_NAMES.length], last, "FEMALE", 1942 + i);
      const unionId = insertUnion(male, female, 1965 + i);
      unions += 1;
      generation.push(male, female);
      for (let c = 0; c < 5; c++) {
        const childGender: Gender = c % 2 === 0 ? "MALE" : "FEMALE";
        const childName =
          childGender === "MALE"
            ? MALE_NAMES[(i + c) % MALE_NAMES.length]
            : FEMALE_NAMES[(i + c) % FEMALE_NAMES.length];
        const childId = insertFixturePerson(childName, last, childGender, 1970 + i * 2 + c);
        linkChild(unionId, childId);
        childrenLinks += 1;
        generation.push(childId);
      }
    }

    onProgress?.({ phase: "Generation 2", percent: 35 });
    const gen2: string[] = [];
    for (let i = 0; i < generation.length - 1; i += 2) {
      const a = generation[i];
      const b = generation[i + 1];
      if (!a || !b) continue;
      const unionId = insertUnion(a, b, 1995 + (i % 10));
      unions += 1;
      for (let c = 0; c < 4; c++) {
        const childGender: Gender = c % 2 === 0 ? "FEMALE" : "MALE";
        const childId = insertFixturePerson(
          childGender === "MALE" ? MALE_NAMES[c % MALE_NAMES.length] : FEMALE_NAMES[c % FEMALE_NAMES.length],
          SURNAMES[(i + c) % SURNAMES.length],
          childGender,
          2000 + (i % 15) + c,
        );
        linkChild(unionId, childId);
        childrenLinks += 1;
        gen2.push(childId);
      }
    }

    onProgress?.({ phase: "Generation 3", percent: 65 });
    const gen3: string[] = [];
    for (let i = 0; i < gen2.length - 1; i += 2) {
      const a = gen2[i];
      const b = gen2[i + 1];
      if (!a || !b) continue;
      const unionId = insertUnion(a, b, 2020 + (i % 5));
      unions += 1;
      for (let c = 0; c < 3; c++) {
        const childGender: Gender = c === 1 ? "OTHER" : c % 2 === 0 ? "MALE" : "FEMALE";
        const childId = insertFixturePerson(
          childGender === "FEMALE" ? FEMALE_NAMES[c % FEMALE_NAMES.length] : MALE_NAMES[c % MALE_NAMES.length],
          SURNAMES[i % SURNAMES.length],
          childGender,
          2010 + (i % 12) + c,
        );
        linkChild(unionId, childId);
        childrenLinks += 1;
        gen3.push(childId);
      }
    }

    onProgress?.({ phase: "Cousin unions", percent: 85 });
    for (let i = 0; i < gen3.length - 3; i += 4) {
      const a = gen3[i];
      const b = gen3[i + 2];
      if (!a || !b) continue;
      insertUnion(a, b, 2035);
      unions += 1;
    }

    db.execSync("COMMIT");
    const persons = countFixturePeople();
    const focal = db.getFirstSync<{ family_code: string }>(
      `SELECT family_code FROM persons WHERE is_fixture = 1 AND first_name = 'Hassan' ORDER BY birth_date LIMIT 1`,
    );
    onProgress?.({ phase: "Done", percent: 100 });
    return {
      persons,
      unions,
      children: childrenLinks,
      focalFamilyCode: focal?.family_code ?? "FAM-10000",
    };
  } catch (error) {
    db.execSync("ROLLBACK");
    throw error;
  }
}
