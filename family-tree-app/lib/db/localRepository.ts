import { copy } from "@/content/businessCopy";
import { AppError } from "@/lib/errors/AppError";
import { getDatabase } from "@/lib/db/database";
import { uniqueFamilyCode } from "@/lib/db/familyCode";
import type {
  CreateMemberInput,
  Gender,
  LocalUnionView,
  MemberRecord,
} from "@/lib/data/types";

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
    currentCity: row.current_city,
    occupation: row.occupation,
    bio: row.bio,
  };
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`;
}

export function listLocalMembers(query = ""): MemberRecord[] {
  const db = getDatabase();
  const trimmed = query.trim();
  const rows = trimmed
    ? db.getAllSync<PersonRow>(
        `SELECT * FROM persons WHERE
          family_code LIKE ? OR first_name LIKE ? OR last_name LIKE ?
          OR urdu_first_name LIKE ? OR urdu_last_name LIKE ?
        ORDER BY updated_at DESC LIMIT 200`,
        [
          `%${trimmed}%`,
          `%${trimmed}%`,
          `%${trimmed}%`,
          `%${trimmed}%`,
          `%${trimmed}%`,
        ],
      )
    : db.getAllSync<PersonRow>(
        "SELECT * FROM persons ORDER BY updated_at DESC LIMIT 200",
      );
  return rows.map(mapRow);
}

export function createLocalMember(input: CreateMemberInput): MemberRecord {
  const db = getDatabase();
  const id = newId();
  const familyCode = uniqueFamilyCode();
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO persons (
      id, family_code, first_name, last_name, gender,
      urdu_first_name, urdu_last_name, current_city,
      privacy_level, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MEMBERS_ONLY', ?, ?)`,
    [
      id,
      familyCode,
      input.firstName,
      input.lastName,
      input.gender,
      input.urduFirstName ?? null,
      input.urduLastName ?? null,
      input.currentCity ?? null,
      now,
      now,
    ],
  );

  const row = db.getFirstSync<PersonRow>("SELECT * FROM persons WHERE id = ?", [
    id,
  ]);
  if (!row) throw new Error("Failed to create member");
  return mapRow(row);
}

export function deleteLocalMember(personId: string): void {
  const db = getDatabase();

  const unionChildCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM children c
     INNER JOIN unions u ON u.id = c.union_id
     WHERE u.partner_1_id = ? OR u.partner_2_id = ?`,
    [personId, personId],
  );

  if (unionChildCount && unionChildCount.count > 0) {
    throw new AppError("VALIDATION", copy.errors.deleteLinkedChildren);
  }

  const asChild = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM children WHERE child_id = ?",
    [personId],
  );
  if (asChild && asChild.count > 0) {
    throw new AppError("VALIDATION", copy.errors.deleteLinkedAsChild);
  }

  db.runSync("DELETE FROM persons WHERE id = ?", [personId]);
}

export function getLocalMemberByFamilyCode(
  familyCode: string,
): MemberRecord | null {
  const db = getDatabase();
  const row = db.getFirstSync<PersonRow>(
    "SELECT * FROM persons WHERE family_code = ?",
    [familyCode],
  );
  return row ? mapRow(row) : null;
}

export function getLocalUnionsForPerson(personId: string): LocalUnionView[] {
  const db = getDatabase();
  const unions = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
  }>(
    `SELECT id, partner_1_id, partner_2_id FROM unions
     WHERE partner_1_id = ? OR partner_2_id = ?`,
    [personId, personId],
  );

  return unions.map((u) => {
    const p1 = db.getFirstSync<PersonRow>(
      "SELECT * FROM persons WHERE id = ?",
      [u.partner_1_id],
    );
    const p2 = db.getFirstSync<PersonRow>(
      "SELECT * FROM persons WHERE id = ?",
      [u.partner_2_id],
    );
    const children = db.getAllSync<PersonRow>(
      `SELECT p.* FROM persons p
       INNER JOIN children c ON c.child_id = p.id
       WHERE c.union_id = ?`,
      [u.id],
    );
    return {
      id: u.id,
      partner1Name: p1 ? `${p1.first_name} ${p1.last_name}` : "—",
      partner2Name: p2 ? `${p2.first_name} ${p2.last_name}` : "—",
      children: children.map((c) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        familyCode: c.family_code,
      })),
    };
  });
}

export function countLocalMembers(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM persons",
  );
  return row?.count ?? 0;
}
