import { getDatabase } from "@/lib/db/database";
import {
  formatPersonDisplayName,
  isUnknownCoParentFamilyCode,
} from "../../../shared/unknownCoParent";

export type ParentCoupleRow = {
  unionId: string;
  partner1Id: string;
  partner2Id: string;
  partner1Code: string;
  partner2Code: string;
  partner1Name: string;
  partner2Name: string;
  partner1Gender: string | null;
  partner2Gender: string | null;
  marriageDate: string | null;
  isActive: boolean;
  childCount: number;
};

export type OrderedCouplePartner = {
  id: string;
  name: string;
  familyCode: string;
};

export function orderedCouplePartners(row: ParentCoupleRow): {
  husband: OrderedCouplePartner;
  wife: OrderedCouplePartner;
} {
  const p1 = {
    id: row.partner1Id,
    name: row.partner1Name,
    familyCode: row.partner1Code,
    gender: row.partner1Gender,
  };
  const p2 = {
    id: row.partner2Id,
    name: row.partner2Name,
    familyCode: row.partner2Code,
    gender: row.partner2Gender,
  };
  const p1Male = p1.gender === "MALE";
  const p2Male = p2.gender === "MALE";
  const p1Female = p1.gender === "FEMALE";
  const p2Female = p2.gender === "FEMALE";
  let husband = p1;
  let wife = p2;
  if (p1Male && !p2Male) {
    husband = p1;
    wife = p2;
  } else if (p2Male && !p1Male) {
    husband = p2;
    wife = p1;
  } else if (p1Female && !p2Female) {
    husband = p2;
    wife = p1;
  } else if (p2Female && !p1Female) {
    husband = p1;
    wife = p2;
  }
  return {
    husband: { id: husband.id, name: husband.name, familyCode: husband.familyCode },
    wife: { id: wife.id, name: wife.name, familyCode: wife.familyCode },
  };
}

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
    p1_gender: string | null;
    p2_gender: string | null;
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
      p1.gender AS p1_gender,
      p2.gender AS p2_gender,
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
        partner1Gender: r.p1_gender,
        partner2Gender: r.p2_gender,
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
  const { husband, wife } = orderedCouplePartners(row);
  const h = formatPersonDisplayName({
    firstName: husband.name.split(" ")[0] ?? husband.name,
    lastName: husband.name.split(" ").slice(1).join(" "),
    familyCode: husband.familyCode,
  });
  const w = formatPersonDisplayName({
    firstName: wife.name.split(" ")[0] ?? wife.name,
    lastName: wife.name.split(" ").slice(1).join(" "),
    familyCode: wife.familyCode,
  });
  if (isUnknownCoParentFamilyCode(wife.familyCode)) {
    return `${h} · Unknown co-parent`;
  }
  if (isUnknownCoParentFamilyCode(husband.familyCode)) {
    return `Unknown co-parent · ${w}`;
  }
  return `${h} · ${w}`;
}
