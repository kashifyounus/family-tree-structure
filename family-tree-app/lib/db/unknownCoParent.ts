import type * as SQLite from "expo-sqlite";

import type { Gender } from "@/lib/data/types";
import {
  UNKNOWN_COPARENT_DISPLAY,
  UNKNOWN_COPARENT_FAMILY_CODE,
  isUnknownCoParentFamilyCode,
  unknownCoParentFamilyCodeForGender,
} from "../../../shared/unknownCoParent";
import type { RuleGender } from "@/lib/rules/relationshipRules";

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`;
}

export function isUnknownCoParentRow(row: {
  family_code: string;
}): boolean {
  return isUnknownCoParentFamilyCode(row.family_code);
}

export function getOrCreateUnknownCoParent(
  db: SQLite.SQLiteDatabase,
  gender: RuleGender,
): string {
  const familyCode = unknownCoParentFamilyCodeForGender(gender);
  const existing = db.getFirstSync<{ id: string }>(
    "SELECT id FROM persons WHERE family_code = ?",
    [familyCode],
  );
  if (existing) return existing.id;

  const id = newId();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO persons (id, family_code, first_name, last_name, gender, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      familyCode,
      UNKNOWN_COPARENT_DISPLAY.firstName,
      UNKNOWN_COPARENT_DISPLAY.lastName,
      gender,
      now,
      now,
    ],
  );
  return id;
}

export function findSingleParentUnionId(
  db: SQLite.SQLiteDatabase,
  knownParentId: string,
): string | null {
  const unions = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
  }>(
    `SELECT id, partner_1_id, partner_2_id FROM unions
     WHERE partner_1_id = ? OR partner_2_id = ?`,
    [knownParentId, knownParentId],
  );
  for (const union of unions) {
    const otherId =
      union.partner_1_id === knownParentId
        ? union.partner_2_id
        : union.partner_1_id;
    const other = db.getFirstSync<{ family_code: string }>(
      "SELECT family_code FROM persons WHERE id = ?",
      [otherId],
    );
    if (other && isUnknownCoParentRow(other)) {
      return union.id;
    }
  }
  return null;
}

export function ensureSingleParentUnion(
  db: SQLite.SQLiteDatabase,
  knownParentId: string,
): string {
  const existing = findSingleParentUnionId(db, knownParentId);
  if (existing) return existing;

  const parent = db.getFirstSync<{ gender: string }>(
    "SELECT gender FROM persons WHERE id = ?",
    [knownParentId],
  );
  const knownGender = (parent?.gender ?? "OTHER") as Gender;
  const missingGender: RuleGender =
    knownGender === "MALE"
      ? "FEMALE"
      : knownGender === "FEMALE"
        ? "MALE"
        : "OTHER";
  const unknownId = getOrCreateUnknownCoParent(db, missingGender);
  const unionId = newId();
  const [partner1Id, partner2Id] =
    knownParentId < unknownId
      ? [knownParentId, unknownId]
      : [unknownId, knownParentId];
  db.runSync(
    `INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)`,
    [unionId, partner1Id, partner2Id],
  );
  return unionId;
}

export function unknownCoParentIds(db: SQLite.SQLiteDatabase): {
  maleId: string;
  femaleId: string;
} {
  return {
    maleId: getOrCreateUnknownCoParent(db, "MALE"),
    femaleId: getOrCreateUnknownCoParent(db, "FEMALE"),
  };
}

/** Reserved codes must never be issued to real members. */
export function assertFamilyCodeNotReserved(code: string): void {
  if (code === UNKNOWN_COPARENT_FAMILY_CODE.MALE || code === UNKNOWN_COPARENT_FAMILY_CODE.FEMALE) {
    throw new Error("This member reference is reserved for the archive.");
  }
}
