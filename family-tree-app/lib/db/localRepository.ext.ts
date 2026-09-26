import { copy } from "@/content/businessCopy";
import { getDatabase } from "@/lib/db/database";
import { uniqueFamilyCode } from "@/lib/db/familyCode";
import type {
  AddChildInput,
  AddSpouseInput,
  Gender,
  LinkChildInput,
  LinkSpouseInput,
  MemberRecord,
  SetParentsInput,
  UpdateMarriageInput,
  UpdateMemberInput,
} from "@/lib/data/types";
import {
  assertCanAssignParents,
  assertCanAttachChild,
  assertCanCreateMarriage,
  assertMarriageTimeline,
  assertPersonDatesAgainstMarriages,
  canonicalPartnerIds,
  findMarriage,
  ruleMessages,
  type RuleGender,
  type RuleGraph,
} from "@/lib/rules/relationshipRules";

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

function loadLocalRuleGraph(): RuleGraph {
  const db = getDatabase();
  const people = db.getAllSync<{
    id: string;
    gender: string;
    birth_date: string | null;
    death_date: string | null;
  }>("SELECT id, gender, birth_date, death_date FROM persons");
  const unions = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
    marriage_date: string | null;
    divorce_date: string | null;
  }>(
    "SELECT id, partner_1_id, partner_2_id, marriage_date, divorce_date FROM unions",
  );
  const children = db.getAllSync<{ union_id: string; child_id: string }>(
    "SELECT union_id, child_id FROM children",
  );
  const childIds = new Map<string, string[]>();
  for (const child of children) {
    const list = childIds.get(child.union_id) ?? [];
    list.push(child.child_id);
    childIds.set(child.union_id, list);
  }
  return {
    people: people.map((person) => ({
      id: person.id,
      gender: person.gender as RuleGender,
      birthDate: person.birth_date,
      deathDate: person.death_date,
    })),
    unions: unions.map((union) => ({
      id: union.id,
      partner1Id: union.partner_1_id,
      partner2Id: union.partner_2_id,
      marriageDate: union.marriage_date,
      divorceDate: union.divorce_date,
      childIds: childIds.get(union.id) ?? [],
    })),
  };
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
  if (!existing) throw new Error(ruleMessages.notFound);

  assertPersonDatesAgainstMarriages(
    loadLocalRuleGraph(),
    input.personId,
    input.birthDate ?? existing.birthDate,
    input.deathDate ?? existing.deathDate,
  );

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
  if (!related) throw new Error(ruleMessages.notFound);

  assertMarriageTimeline({
    marriageDate: input.marriageDate,
    births: [related.birthDate],
    deaths: [related.deathDate],
  });

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
  const [partner1Id, partner2Id] = canonicalPartnerIds(related.id, spouseId);
  db.runSync(
    `INSERT INTO unions (id, partner_1_id, partner_2_id, marriage_date, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [unionId, partner1Id, partner2Id, input.marriageDate ?? null],
  );

  touchPerson(db, related.id);
  const spouse = getLocalMemberById(spouseId);
  if (!spouse) throw new Error("Failed to create spouse");
  return spouse;
}

export function addLocalChild(input: AddChildInput): MemberRecord {
  const db = getDatabase();
  const parent = getLocalMemberById(input.parentPersonId);
  if (!parent) throw new Error(ruleMessages.notFound);

  let unionId = input.unionId;
  if (!unionId && input.secondParentId) {
    const graph = loadLocalRuleGraph();
    assertCanCreateMarriage(graph, parent.id, input.secondParentId);
    unionId = newId();
    const [partner1Id, partner2Id] = canonicalPartnerIds(
      parent.id,
      input.secondParentId,
    );
    db.runSync(
      `INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)`,
      [unionId, partner1Id, partner2Id],
    );
  }
  if (!unionId) {
    throw new Error(copy.errors.needMarriageForChild);
  }
  if (input.unionId) {
    const chosen = loadLocalRuleGraph().unions.find((union) => union.id === input.unionId);
    if (!chosen) throw new Error(ruleMessages.marriageMissing);
    if (chosen.partner1Id !== parent.id && chosen.partner2Id !== parent.id) {
      throw new Error("Choose a marriage that includes this person.");
    }
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
    `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, ?)`,
    [newId(), unionId, childId, input.relationshipType ?? "BIOLOGICAL"],
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

export function linkLocalSpouse(input: LinkSpouseInput): { unionId: string } {
  const graph = loadLocalRuleGraph();
  assertCanCreateMarriage(graph, input.personId, input.spouseId, input.marriageDate);
  const db = getDatabase();
  const unionId = newId();
  const [partner1Id, partner2Id] = canonicalPartnerIds(input.personId, input.spouseId);
  db.runSync(
    `INSERT INTO unions (id, partner_1_id, partner_2_id, marriage_date, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [unionId, partner1Id, partner2Id, input.marriageDate ?? null],
  );
  touchPerson(db, input.personId);
  return { unionId };
}

export function linkLocalChild(input: LinkChildInput): void {
  const graph = loadLocalRuleGraph();
  assertCanAttachChild(graph, input.unionId, input.childId);
  const db = getDatabase();
  db.runSync(
    `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, ?)`,
    [newId(), input.unionId, input.childId, input.relationshipType ?? "BIOLOGICAL"],
  );
}

export function setLocalParents(input: SetParentsInput): { unionId: string } {
  const graph = loadLocalRuleGraph();
  assertCanAssignParents(graph, input.personId, input.parentAId, input.parentBId);
  const db = getDatabase();
  let unionId = findMarriage(graph, input.parentAId, input.parentBId)?.id;
  if (!unionId) {
    assertCanCreateMarriage(graph, input.parentAId, input.parentBId);
    unionId = newId();
    const [partner1Id, partner2Id] = canonicalPartnerIds(input.parentAId, input.parentBId);
    db.runSync(
      `INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)`,
      [unionId, partner1Id, partner2Id],
    );
  }
  const relationship = input.relationshipType ?? "BIOLOGICAL";
  const existing = db.getFirstSync<{ id: string; union_id: string }>(
    "SELECT id, union_id FROM children WHERE child_id = ? ORDER BY id LIMIT 1",
    [input.personId],
  );
  const already = db.getFirstSync<{ id: string }>(
    "SELECT id FROM children WHERE union_id = ? AND child_id = ?",
    [unionId, input.personId],
  );
  if (existing && existing.union_id === unionId) {
    db.runSync("UPDATE children SET relationship_type = ? WHERE id = ?", [
      relationship,
      existing.id,
    ]);
  } else if (existing && already) {
    db.runSync("DELETE FROM children WHERE id = ?", [existing.id]);
  } else if (existing) {
    db.runSync("UPDATE children SET union_id = ?, relationship_type = ? WHERE id = ?", [
      unionId,
      relationship,
      existing.id,
    ]);
  } else if (!already) {
    db.runSync(
      `INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, ?)`,
      [newId(), unionId, input.personId, relationship],
    );
  }
  touchPerson(db, input.personId);
  return { unionId };
}

/** Links a person as child of an existing marriage (creates childship immediately). */
export function assignLocalPersonToCouple(
  personId: string,
  unionId: string,
): { unionId: string } {
  const db = getDatabase();
  const union = db.getFirstSync<{ partner_1_id: string; partner_2_id: string }>(
    "SELECT partner_1_id, partner_2_id FROM unions WHERE id = ?",
    [unionId],
  );
  if (!union) throw new Error(ruleMessages.marriageMissing);
  return setLocalParents({
    personId,
    parentAId: union.partner_1_id,
    parentBId: union.partner_2_id,
  });
}

export function updateLocalMarriage(input: UpdateMarriageInput): void {
  const db = getDatabase();
  const current = db.getFirstSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
    marriage_date: string | null;
    divorce_date: string | null;
  }>(
    "SELECT id, partner_1_id, partner_2_id, marriage_date, divorce_date FROM unions WHERE id = ?",
    [input.unionId],
  );
  if (!current) throw new Error(ruleMessages.marriageMissing);
  const graph = loadLocalRuleGraph();
  const partner1 = graph.people.find((person) => person.id === current.partner_1_id);
  const partner2 = graph.people.find((person) => person.id === current.partner_2_id);
  const marriageDate =
    input.marriageDate === undefined ? current.marriage_date : input.marriageDate;
  const divorceDate =
    input.divorceDate === undefined ? current.divorce_date : input.divorceDate;
  assertMarriageTimeline({
    marriageDate,
    divorceDate,
    births: [partner1?.birthDate, partner2?.birthDate],
    deaths: [partner1?.deathDate, partner2?.deathDate],
  });
  db.runSync(
    "UPDATE unions SET marriage_date = ?, divorce_date = ?, is_active = ? WHERE id = ?",
    [
      marriageDate,
      divorceDate,
      input.isActive === false ? 0 : divorceDate ? 0 : 1,
      input.unionId,
    ],
  );
}

export function getLocalMarriage(unionId: string) {
  const db = getDatabase();
  const union = db.getFirstSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
    marriage_date: string | null;
    divorce_date: string | null;
    is_active: number;
  }>(
    "SELECT id, partner_1_id, partner_2_id, marriage_date, divorce_date, is_active FROM unions WHERE id = ?",
    [unionId],
  );
  if (!union) return null;
  const partner1 = getLocalMemberById(union.partner_1_id);
  const partner2 = getLocalMemberById(union.partner_2_id);
  const children = db.getAllSync<{
    id: string;
    first_name: string;
    last_name: string;
    family_code: string;
    relationship_type: string;
  }>(
    `SELECT p.id, p.first_name, p.last_name, p.family_code, c.relationship_type
     FROM children c INNER JOIN persons p ON p.id = c.child_id WHERE c.union_id = ?`,
    [unionId],
  );
  return {
    id: union.id,
    partner1,
    partner2,
    marriageDate: union.marriage_date,
    divorceDate: union.divorce_date,
    isActive: union.is_active !== 0,
    children,
  };
}

export function listLocalPeopleBrief(): {
  id: string;
  name: string;
  familyCode: string;
  birthDate: string | null;
  currentCity: string | null;
  gender: string | null;
}[] {
  const db = getDatabase();
  return db
    .getAllSync<{
      id: string;
      first_name: string;
      last_name: string;
      family_code: string;
      birth_date: string | null;
      current_city: string | null;
      gender: string | null;
    }>(
      "SELECT id, first_name, last_name, family_code, birth_date, current_city, gender FROM persons ORDER BY last_name, first_name",
    )
    .map((person) => ({
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      familyCode: person.family_code,
      birthDate: person.birth_date,
      currentCity: person.current_city,
      gender: person.gender,
    }));
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
