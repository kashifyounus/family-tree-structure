import { getDatabase, resetLocalDatabase } from "@/lib/db/database";

function id(): string {
  return globalThis.crypto?.randomUUID?.() ?? `seed-${Math.random()}`;
}

export function seedLocalDemoFamily(): string {
  resetLocalDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();

  const hassan = id();
  const ayesha = id();
  const fatima = id();
  const child1 = id();

  const insertPerson = (
    personId: string,
    code: string,
    first: string,
    last: string,
    gender: string,
    urduFirst?: string,
  ) => {
    db.runSync(
      `INSERT INTO persons (id, family_code, first_name, last_name, gender, urdu_first_name, privacy_level, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'MEMBERS_ONLY', ?, ?)`,
      [personId, code, first, last, gender, urduFirst ?? null, now, now],
    );
  };

  insertPerson(hassan, "FAM-10004", "Hassan", "Khan", "MALE", "حسن");
  insertPerson(ayesha, "FAM-10005", "Ayesha", "Khan", "FEMALE", "عائشہ");
  insertPerson(fatima, "FAM-10006", "Fatima", "Khan", "FEMALE", "فاطمہ");
  insertPerson(child1, "FAM-10007", "Ali", "Khan", "MALE", "علی");

  const union1 = id();
  const union2 = id();
  db.runSync(
    "INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)",
    [union1, hassan, ayesha],
  );
  db.runSync(
    "INSERT INTO unions (id, partner_1_id, partner_2_id, is_active) VALUES (?, ?, ?, 1)",
    [union2, hassan, fatima],
  );
  db.runSync(
    "INSERT INTO children (id, union_id, child_id, relationship_type) VALUES (?, ?, ?, 'BIOLOGICAL')",
    [id(), union1, child1],
  );

  return "FAM-10004";
}
