import { getDatabase } from "@/lib/db/database";

export type HouseholdReportView = {
  husbandName: string;
  wifeCount: number;
  totalChildren: number;
  byWife: { wifeName: string; childrenCount: number }[];
};

type PersonRow = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
};

export function buildLocalHouseholdReport(
  familyCode: string,
): HouseholdReportView | null {
  const db = getDatabase();
  const trimmed = familyCode.trim();
  if (!trimmed) return null;

  const focal = db.getFirstSync<PersonRow>(
    "SELECT id, first_name, last_name, gender FROM persons WHERE family_code = ?",
    [trimmed],
  );
  if (!focal) return null;

  const husband = resolveHusbandSubject(db, focal);
  if (!husband) return null;

  const unions = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
    marriage_date: string | null;
  }>(
    `SELECT id, partner_1_id, partner_2_id, marriage_date
     FROM unions
     WHERE partner_1_id = ? OR partner_2_id = ?
     ORDER BY marriage_date ASC`,
    [husband.id, husband.id],
  );

  const byWife = unions.map((u) => {
    const wifeId =
      u.partner_1_id === husband.id ? u.partner_2_id : u.partner_1_id;
    const wife = db.getFirstSync<{ first_name: string; last_name: string }>(
      "SELECT first_name, last_name FROM persons WHERE id = ?",
      [wifeId],
    );
    const countRow = db.getFirstSync<{ c: number }>(
      "SELECT COUNT(*) as c FROM children WHERE union_id = ?",
      [u.id],
    );
    const wifeName = wife
      ? `${wife.first_name} ${wife.last_name}`.trim()
      : "Unknown";
    return {
      wifeName,
      childrenCount: countRow?.c ?? 0,
    };
  });

  return {
    husbandName: `${husband.first_name} ${husband.last_name}`.trim(),
    wifeCount: byWife.length,
    totalChildren: byWife.reduce((sum, w) => sum + w.childrenCount, 0),
    byWife,
  };
}

function resolveHusbandSubject(
  db: ReturnType<typeof getDatabase>,
  focal: PersonRow,
): PersonRow | null {
  if (focal.gender === "MALE") return focal;
  if (focal.gender !== "FEMALE") return null;

  const unions = db.getAllSync<{
    partner_1_id: string;
    partner_2_id: string;
    marriage_date: string | null;
  }>(
    `SELECT partner_1_id, partner_2_id, marriage_date
     FROM unions
     WHERE partner_1_id = ? OR partner_2_id = ?
     ORDER BY marriage_date ASC`,
    [focal.id, focal.id],
  );

  for (const u of unions) {
    const partnerId =
      u.partner_1_id === focal.id ? u.partner_2_id : u.partner_1_id;
    const partner = db.getFirstSync<PersonRow>(
      "SELECT id, first_name, last_name, gender FROM persons WHERE id = ?",
      [partnerId],
    );
    if (partner?.gender === "MALE") return partner;
  }
  return null;
}
