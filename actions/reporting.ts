"use server";

import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/age";
import { getConnectedPersonIds } from "@/lib/familyScope";
import {
  buildHusbandFamilyReport,
  husbandSubjectForHouseholdReport,
} from "@/lib/household";
import type { UnionRecord } from "@/lib/kinship";
import { getAuthContext } from "@/lib/auth.server";
import { maskPersonSummary } from "@/lib/privacy";
import { toPersonSummary } from "@/lib/personMapper";
import type {
  AgeDemographicBucket,
  CityDistributionReport,
  HusbandFamilyReport,
} from "@/types/family";

async function loadAllUnions(): Promise<UnionRecord[]> {
  const unions = await prisma.union.findMany({
    include: {
      partner1: true,
      partner2: true,
      children: { include: { child: true } },
    },
  });
  return unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    partner1: u.partner1,
    partner2: u.partner2,
    childships: u.children.map((c) => ({
      childId: c.childId,
      child: c.child,
      relationshipType: c.relationshipType,
    })),
  }));
}

async function getScopedPeople(familyCode: string) {
  const focal = await prisma.person.findUnique({ where: { familyCode } });
  if (!focal) return [];

  const unions = await loadAllUnions();
  const ids = getConnectedPersonIds(focal.id, unions);
  return prisma.person.findMany({ where: { id: { in: [...ids] } } });
}

function groupByField(
  people: Record<string, unknown>[],
  field: string,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of people) {
    const raw = p[field] as string | null | undefined;
    const label = raw?.trim() || "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCityDistribution(
  familyCode: string,
): Promise<CityDistributionReport | null> {
  const people = await getScopedPeople(familyCode);
  if (people.length === 0) return null;

  return {
    currentCity: groupByField(people, "currentCity"),
    homeTown: groupByField(people, "homeTown"),
    birthPlace: groupByField(people, "birthPlace"),
  };
}

export async function getAgeDemographics(
  familyCode: string,
): Promise<AgeDemographicBucket[]> {
  const people = await getScopedPeople(familyCode);
  const buckets = new Map<string, number>([
    ["0–17", 0],
    ["18–35", 0],
    ["36–55", 0],
    ["56+", 0],
    ["Unknown", 0],
  ]);

  for (const p of people) {
    const age = calculateAge(
      p.birthDate?.toISOString() ?? null,
      p.deathDate?.toISOString() ?? null,
    );
    if (age == null) {
      buckets.set("Unknown", (buckets.get("Unknown") ?? 0) + 1);
      continue;
    }
    if (age <= 17) buckets.set("0–17", (buckets.get("0–17") ?? 0) + 1);
    else if (age <= 35) buckets.set("18–35", (buckets.get("18–35") ?? 0) + 1);
    else if (age <= 55) buckets.set("36–55", (buckets.get("36–55") ?? 0) + 1);
    else buckets.set("56+", (buckets.get("56+") ?? 0) + 1);
  }

  return [...buckets.entries()].map(([range, count]) => ({ range, count }));
}

export async function getHusbandFamilyReport(
  personId: string,
): Promise<HusbandFamilyReport | null> {
  const viewer = await getAuthContext();
  const focal = await prisma.person.findUnique({ where: { id: personId } });
  if (!focal) return null;

  const focalUnions = await prisma.union.findMany({
    where: {
      OR: [{ partner1Id: personId }, { partner2Id: personId }],
    },
    include: {
      partner1: true,
      partner2: true,
      children: { include: { child: true } },
    },
    orderBy: { marriageDate: "asc" },
  });

  const husbandSubject = husbandSubjectForHouseholdReport(focal, focalUnions);
  if (!husbandSubject) return null;

  const unions =
    husbandSubject.id === focal.id
      ? focalUnions
      : await prisma.union.findMany({
          where: {
            OR: [
              { partner1Id: husbandSubject.id },
              { partner2Id: husbandSubject.id },
            ],
          },
          include: {
            partner1: true,
            partner2: true,
            children: { include: { child: true } },
          },
          orderBy: { marriageDate: "asc" },
        });

  const report = buildHusbandFamilyReport(husbandSubject, unions);
  if (!report) return null;

  return {
    ...report,
    byWife: report.byWife.map((group) => ({
      ...group,
      children: group.children.map((c) => maskPersonSummary(c, viewer)),
    })),
  };
}

export async function getHouseholdMetrics(familyCode: string) {
  const focal = await prisma.person.findUnique({ where: { familyCode } });
  if (!focal) return null;

  const report = await getHusbandFamilyReport(focal.id);
  const city = await getCityDistribution(familyCode);
  const ages = await getAgeDemographics(familyCode);

  return {
    focal: toPersonSummary(focal),
    household: report,
    city,
    ages,
  };
}
