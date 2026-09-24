import { getDatabase } from "@/lib/db/database";

export type ParentNames = {
  fatherName: string | null;
  motherName: string | null;
};

export function getParentNamesForPerson(personId: string): ParentNames {
  const db = getDatabase();
  const child = db.getFirstSync<{ union_id: string }>(
    "SELECT union_id FROM children WHERE child_id = ? LIMIT 1",
    [personId],
  );
  if (!child) {
    return { fatherName: null, motherName: null };
  }

  const partners = db.getAllSync<{ id: string; first_name: string; last_name: string; gender: string }>(
    `SELECT p.id, p.first_name, p.last_name, p.gender
     FROM unions u
     JOIN persons p ON p.id = u.partner_1_id OR p.id = u.partner_2_id
     WHERE u.id = ? AND p.id IN (u.partner_1_id, u.partner_2_id)`,
    [child.union_id],
  );

  let fatherName: string | null = null;
  let motherName: string | null = null;
  for (const p of partners) {
    const name = `${p.first_name} ${p.last_name}`.trim();
    if (p.gender === "MALE" && !fatherName) fatherName = name;
    else if (p.gender === "FEMALE" && !motherName) motherName = name;
    else if (!fatherName) fatherName = name;
    else if (!motherName) motherName = name;
  }

  return { fatherName, motherName };
}

export function formatParentLine(parents: ParentNames): string {
  const f = parents.fatherName ?? "—";
  const m = parents.motherName ?? "—";
  return `Father: ${f} · Mother: ${m}`;
}
