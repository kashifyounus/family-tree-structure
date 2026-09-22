import { copy } from "@/content/businessCopy";
import { getDatabase } from "@/lib/db/database";
import { uniqueFamilyCode } from "@/lib/db/familyCode";
import type {
  AddChildInput,
  AddSpouseInput,
  Gender,
  MemberRecord,
  UpdateMemberInput,
} from "@/lib/data/types";
import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";

type PersonRow = {
  id: string;
  family_code: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  urdu_first_name: string | null;
  urdu_last_name: string | null;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  current_city: string | null;
  occupation: string | null;
  bio: string | null;
  birth_place: string | null;
  home_town: string | null;
};

function mapRow(row: PersonRow): MemberRecord {
  return {
    id: row.id,
    familyCode: row.family_code,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    urduFirstName: row.urdu_first_name,
    urduLastName: row.urdu_last_name,
    gender: row.gender as Gender,
    birthDate: row.birth_date,
    deathDate: row.death_date,
    birthPlace: row.birth_place,
    homeTown: row.home_town,
    currentCity: row.current_city,
    occupation: row.occupation,
    bio: row.bio,
  };
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`;
}

function touchPerson(db: ReturnType<typeof getDatabase>, id: string) {
  db.runSync("UPDATE persons SET updated_at = ? WHERE id = ?", [
    new Date().toISOString(),
    id,
  ]);
}

export function getLocalMemberById(personId: string): MemberRecord | null {
  const db = getDatabase();
  const row = db.getFirstSync<PersonRow>("SELECT * FROM persons WHERE id = ?", [
    personId,
  ]);
  return row ? mapRow(row) : null;
}

export function updateLocalMember(input: UpdateMemberInput): MemberRecord {
  const db = getDatabase();
  const existing = getLocalMemberById(input.personId);
  if (!existing) throw new Error("Person not found");

  db.runSync(
    `UPDATE persons SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      gender = COALESCE(?, gender),
      urdu_first_name = COALESCE(?, urdu_first_name),
      urdu_last_name = COALESCE(?, urdu_last_name),
      current_city = COALESCE(?, current_city),
      occupation = COALESCE(?, occupation),
      bio = COALESCE(?, bio),
      birth_date = COALESCE(?, birth_date),
      death_date = COALESCE(?, death_date),
      birth_place = COALESCE(?, birth_place),
      home_town = COALESCE(?, home_town),
      updated_at = ?
    WHERE id = ?`,
    [
      input.firstName ?? null,
      input.lastName ?? null,
      input.gender ?? null,
      input.urduFirstName ?? null,
      input.urduLastName ?? null,
      input.currentCity ?? null,
      input.occupation ?? null,
      input.bio ?? null,
      input.birthDate ?? null,
      input.deathDate ?? null,
      input.birthPlace ?? null,
      input.homeTown ?? null,
      new Date().toISOString(),
      input.personId,
    ],
  );

  const updated = getLocalMemberById(input.personId);
  if (!updated) throw new Error("Update failed");
  return updated;
}

export function addLocalSpouse(input: AddSpouseInput): MemberRecord {
  const db = getDatabase();
  const related = getLocalMemberById(input.relatedPersonId);
  if (!related) throw new Error("Related person not found");

  const spouseId = newId();
  const familyCode = uniqueFamilyCode();
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO persons (id, family_code, first_name, last_name, gender, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      spouseId,
      familyCode,
      input.firstName,
      input.lastName,
      input.gender,
      now,
      now,
    ],
  );

  const unionId = newId();
  db.runSync(
    `INSERT INTO unions (id, partner_1_id, partner_2_id, marriage_date, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [unionId, related.id, spouseId, input.marriageDate ?? null],
  );

  touchPerson(db, related.id);
  const spouse = getLocalMemberById(spouseId);
  if (!spouse) throw new Error("Failed to create spouse");
  return spouse;
}

export function addLocalChild(input: AddChildInput): MemberRecord {
  const db = getDatabase();
  const parent = getLocalMemberById(input.parentPersonId);
  if (!parent) throw new Error("Parent not found");

  let unionId = input.unionId;
  if (!unionId && input.secondParentId) {
    unionId = newId();
    db.runSync(
      `INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)`,
      [unionId, parent.id, input.secondParentId],
    );
  }
  if (!unionId) {
    throw new Error(copy.errors.needMarriageForChild);
  }

  const childId = newId();
  const familyCode = uniqueFamilyCode();
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO persons (id, family_code, first_name, last_name, gender, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [childId, familyCode, input.firstName, input.lastName, input.gender, now, now],
  );

  db.runSync(
    `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, 'BIOLOGICAL')`,
    [newId(), unionId, childId],
  );

  touchPerson(db, parent.id);
  const child = getLocalMemberById(childId);
  if (!child) throw new Error("Failed to create child");
  return child;
}

export function listLocalUnionOptions(personId: string): { id: string; label: string }[] {
  const db = getDatabase();
  const unions = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
  }>(
    `SELECT id, partner_1_id, partner_2_id FROM unions WHERE partner_1_id = ? OR partner_2_id = ?`,
    [personId, personId],
  );

  return unions.map((u, index) => {
    const otherId = u.partner_1_id === personId ? u.partner_2_id : u.partner_1_id;
    const other = db.getFirstSync<PersonRow>("SELECT * FROM persons WHERE id = ?", [
      otherId,
    ]);
    const name = other ? `${other.first_name} ${other.last_name}` : "Partner";
    return { id: u.id, label: `Marriage ${index + 1} · ${name}` };
  });
}

export function exportLocalDatabaseJson(): string {
  const db = getDatabase();
  const persons = db.getAllSync("SELECT * FROM persons");
  const unions = db.getAllSync("SELECT * FROM unions");
  const children = db.getAllSync("SELECT * FROM children");
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), persons, unions, children },
    null,
    2,
  );
}

export function importLocalDatabaseJson(json: string): void {
  const payload = JSON.parse(json) as {
    persons: Record<string, unknown>[];
    unions: Record<string, unknown>[];
    children: Record<string, unknown>[];
  };
  const db = getDatabase();
  db.execSync("DELETE FROM children; DELETE FROM unions; DELETE FROM persons;");
  for (const p of payload.persons ?? []) {
    const cols = Object.keys(p);
    const placeholders = cols.map(() => "?").join(",");
    db.runSync(
      `INSERT INTO persons (${cols.join(",")}) VALUES (${placeholders})`,
      cols.map((c) => p[c] as string | number | null),
    );
  }
  for (const u of payload.unions ?? []) {
    const cols = Object.keys(u);
    const placeholders = cols.map(() => "?").join(",");
    db.runSync(
      `INSERT INTO unions (${cols.join(",")}) VALUES (${placeholders})`,
      cols.map((c) => u[c] as string | number | null),
    );
  }
  for (const c of payload.children ?? []) {
    const cols = Object.keys(c);
    const placeholders = cols.map(() => "?").join(",");
    db.runSync(
      `INSERT INTO children (${cols.join(",")}) VALUES (${placeholders})`,
      cols.map((col) => c[col] as string | number | null),
    );
  }
}
