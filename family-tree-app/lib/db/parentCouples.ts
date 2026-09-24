import { getDatabase } from "@/lib/db/database";
export type ParentCoupleRow = {
  unionId: string;
  partner1Id: string;
  partner2Id: string;
  partner1Code: string;
  partner2Code: string;
  partner1Name: string;
  partner2Name: string;
  marriageDate: string | null;
  isActive: boolean;
  childCount: number;
};

export type ParentCoupleFilters = {
  livingOnly?: boolean;
  activeMarriageOnly?: boolean;
};

export function listParentCoupleRows(
  query: string,
  excludePersonId: string,
  filters: ParentCoupleFilters = {},
): ParentCoupleRow[] {
  const db = getDatabase();
  const trimmed = query.trim().toLowerCase();
  const rows = db.getAllSync<{
    union_id: string;
    partner_1_id: string;
    partner_2_id: string;
    p1_code: string;
    p2_code: string;
    p1_first: string;
    p1_last: string;
    p2_first: string;
    p2_last: string;
    p1_death: string | null;
    p2_death: string | null;
    marriage_date: string | null;
    is_active: number;
    child_count: number;
  }>(`
    SELECT
      u.id AS union_id,
      u.partner_1_id,
      u.partner_2_id,
      p1.family_code AS p1_code,
      p2.family_code AS p2_code,
      p1.first_name AS p1_first,
      p1.last_name AS p1_last,
      p2.first_name AS p2_first,
      p2.last_name AS p2_last,
      p1.death_date AS p1_death,
      p2.death_date AS p2_death,
      u.marriage_date,
      u.is_active,
      (SELECT COUNT(*) FROM children c WHERE c.union_id = u.id) AS child_count
    FROM unions u
    JOIN persons p1 ON p1.id = u.partner_1_id
    JOIN persons p2 ON p2.id = u.partner_2_id
    WHERE u.partner_1_id != ? AND u.partner_2_id != ?
    ORDER BY p1.last_name, p1.first_name
    LIMIT 400
  `, [excludePersonId, excludePersonId]);

  return rows
    .map((r) => {
      const partner1Name = `${r.p1_first} ${r.p1_last}`.trim();
      const partner2Name = `${r.p2_first} ${r.p2_last}`.trim();
      return {
        unionId: r.union_id,
        partner1Id: r.partner_1_id,
        partner2Id: r.partner_2_id,
        partner1Code: r.p1_code,
        partner2Code: r.p2_code,
        partner1Name,
        partner2Name,
        marriageDate: r.marriage_date,
        isActive: r.is_active === 1,
        childCount: r.child_count,
      };
    })
    .filter((row) => {
      if (filters.activeMarriageOnly && !row.isActive) return false;
      if (filters.livingOnly) {
        const rowData = rows.find((x) => x.union_id === row.unionId);
        if (rowData?.p1_death || rowData?.p2_death) return false;
      }
      if (!trimmed) return true;
      const hay = `${row.partner1Name} ${row.partner2Name} ${row.partner1Code} ${row.partner2Code}`.toLowerCase();
      return hay.includes(trimmed);
    });
}

export function formatCoupleLabel(row: ParentCoupleRow): string {
  return `${row.partner1Name} × ${row.partner2Name}`;
}
