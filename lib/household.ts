import type { Person } from "@prisma/client";
import type { HusbandFamilyReport } from "@/types/family";
import { formatUrduName, toPersonSummary } from "@/lib/personMapper";

export type UnionWithChildren = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  marriageDate: Date | null;
  partner1: Person;
  partner2: Person;
  children: {
    child: Person;
    relationshipType: string;
  }[];
};

/** When the focal person is a wife, use her husband for polygamy household metrics. */
export function husbandSubjectForHouseholdReport(
  focal: Person,
  focalUnions: UnionWithChildren[],
): Person | null {
  if (focal.gender === "MALE") return focal;
  if (focal.gender !== "FEMALE") return null;

  const sorted = [...focalUnions].sort((a, b) => {
    if (!a.marriageDate) return 1;
    if (!b.marriageDate) return -1;
    return a.marriageDate.getTime() - b.marriageDate.getTime();
  });

  for (const u of sorted) {
    const partner = u.partner1Id === focal.id ? u.partner2 : u.partner1;
    if (partner.gender === "MALE") return partner;
  }
  return null;
}

export function buildHusbandFamilyReport(
  husband: Person,
  unions: UnionWithChildren[],
): HusbandFamilyReport | null {
  if (husband.gender !== "MALE") return null;

  const husbandUnions = unions.filter(
    (u) => u.partner1Id === husband.id || u.partner2Id === husband.id,
  );

  const byWife = husbandUnions
    .map((u) => {
      const wife = u.partner1Id === husband.id ? u.partner2 : u.partner1;
      const wifeSummary = toPersonSummary(wife);
      const childSummaries = u.children.map((c) => toPersonSummary(c.child));

      return {
        wifeId: wife.id,
        wifeName: `${wife.firstName} ${wife.lastName}`,
        urduName: formatUrduName(wifeSummary),
        unionId: u.id,
        marriageDate: u.marriageDate?.toISOString() ?? null,
        childrenCount: childSummaries.length,
        children: childSummaries,
      };
    })
    .sort((a, b) => {
      if (!a.marriageDate) return 1;
      if (!b.marriageDate) return -1;
      return a.marriageDate.localeCompare(b.marriageDate);
    });

  return {
    husbandId: husband.id,
    husbandName: `${husband.firstName} ${husband.lastName}`,
    wifeCount: byWife.length,
    totalChildren: byWife.reduce((sum, g) => sum + g.childrenCount, 0),
    byWife,
  };
}
