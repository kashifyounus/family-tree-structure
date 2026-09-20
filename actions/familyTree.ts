"use server";

import { prisma } from "@/lib/prisma";
import { generateFamilyCode } from "@/lib/familyCode";
import { buildFamilyGraph } from "@/lib/graphLayout";
import {
  computeAuntsAndUncles,
  computeRelationshipPath,
  type UnionRecord,
} from "@/lib/kinship";
import { birthYearFromPerson, toPersonSummary } from "@/lib/personMapper";
import type {
  CreatePersonAndUnionInput,
  FamilyGraph,
  PersonDetails,
  RelationshipPath,
  SearchResult,
} from "@/types/family";
import type { Person, Prisma } from "@prisma/client";

async function loadAllUnions(): Promise<UnionRecord[]> {
  const unions = await prisma.union.findMany({
    include: {
      partner1: true,
      partner2: true,
      childships: { include: { child: true } },
    },
  });
  return unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    partner1: u.partner1,
    partner2: u.partner2,
    childships: u.childships.map((c) => ({
      childId: c.childId,
      child: c.child,
      relationshipType: c.relationshipType,
    })),
  }));
}

async function uniqueFamilyCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateFamilyCode();
    const existing = await prisma.person.findUnique({
      where: { familyCode: code },
    });
    if (!existing) return code;
  }
  throw new Error("Unable to generate unique family code");
}

export async function getPersonDetails(personId: string): Promise<PersonDetails | null> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      childships: {
        include: {
          union: {
            include: {
              partner1: true,
              partner2: true,
              childships: { include: { child: true } },
            },
          },
        },
      },
      unionsAsPartner1: {
        include: {
          partner1: true,
          partner2: true,
          childships: { include: { child: true } },
        },
        orderBy: { sequenceOrder: "asc" },
      },
      unionsAsPartner2: {
        include: {
          partner1: true,
          partner2: true,
          childships: { include: { child: true } },
        },
        orderBy: { sequenceOrder: "asc" },
      },
    },
  });

  if (!person) return null;

  const unionMap = new Map<string, (typeof person.unionsAsPartner1)[0]>();
  for (const u of [...person.unionsAsPartner1, ...person.unionsAsPartner2]) {
    unionMap.set(u.id, u);
  }

  const unions = [...unionMap.values()].map((u) => ({
    id: u.id,
    partner1: toPersonSummary(u.partner1),
    partner2: toPersonSummary(u.partner2),
    marriageDate: u.marriageDate?.toISOString() ?? null,
    divorceDate: u.divorceDate?.toISOString() ?? null,
    isActive: u.isActive,
    sequenceOrder: u.sequenceOrder,
    children: u.childships.map((c) => ({
      ...toPersonSummary(c.child),
      relationshipType: c.relationshipType,
      unionId: u.id,
    })),
  }));

  const allUnions = await loadAllUnions();
  const allPeople = await prisma.person.findMany();
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));

  const computed = computeAuntsAndUncles(
    person.id,
    person.childships,
    allUnions,
    peopleById,
  );

  return {
    person: toPersonSummary(person),
    unions,
    computed,
  };
}

export async function getPersonDetailsByFamilyCode(
  familyCode: string,
): Promise<PersonDetails | null> {
  const person = await prisma.person.findUnique({ where: { familyCode } });
  if (!person) return null;
  return getPersonDetails(person.id);
}

export async function getFamilyGraph(familyCode: string): Promise<FamilyGraph | null> {
  const focal = await prisma.person.findUnique({ where: { familyCode } });
  if (!focal) return null;

  const allPeople = await prisma.person.findMany();
  const unions = await loadAllUnions();
  return buildFamilyGraph(focal, allPeople, unions, 2, 2);
}

export async function searchMembers(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const yearMatch = /^\d{4}$/.test(trimmed) ? parseInt(trimmed, 10) : null;

  const where: Prisma.PersonWhereInput = yearMatch
    ? {
        birthDate: {
          gte: new Date(`${yearMatch}-01-01`),
          lte: new Date(`${yearMatch}-12-31`),
        },
      }
    : {
        OR: [
          { familyCode: { contains: trimmed, mode: "insensitive" } },
          { firstName: { contains: trimmed, mode: "insensitive" } },
          { lastName: { contains: trimmed, mode: "insensitive" } },
          {
            AND: trimmed.split(/\s+/).map((part) => ({
              OR: [
                { firstName: { contains: part, mode: "insensitive" } },
                { lastName: { contains: part, mode: "insensitive" } },
              ],
            })),
          },
        ],
      };

  const results = await prisma.person.findMany({
    where,
    take: 20,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return results.map((p) => ({
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    birthYear: birthYearFromPerson(p),
  }));
}

export async function createPersonAndUnion(
  data: CreatePersonAndUnionInput,
): Promise<{ personId: string; familyCode: string }> {
  const familyCode = await uniqueFamilyCode();
  const birthDate = data.birthDate ? new Date(data.birthDate) : undefined;
  const deathDate = data.deathDate ? new Date(data.deathDate) : undefined;

  const related = await prisma.person.findUnique({
    where: { id: data.relatedPersonId },
  });
  if (!related) {
    throw new Error("Related person not found");
  }

  const newPerson = await prisma.person.create({
    data: {
      familyCode,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthDate,
      deathDate,
      bio: data.bio,
      isLiving: data.isLiving ?? true,
    },
  });

  if (data.mode === "spouse") {
    const spouseCount = await prisma.union.count({
      where: {
        OR: [
          { partner1Id: related.id },
          { partner2Id: related.id },
        ],
      },
    });
    await prisma.union.create({
      data: {
        partner1Id: related.id,
        partner2Id: newPerson.id,
        marriageDate: data.marriageDate ? new Date(data.marriageDate) : undefined,
        isActive: true,
        sequenceOrder: spouseCount,
      },
    });
  } else {
    let unionId = data.existingUnionId;
    if (!unionId && data.secondParentId) {
      const union = await prisma.union.create({
        data: {
          partner1Id: related.id,
          partner2Id: data.secondParentId,
          isActive: true,
          sequenceOrder: 0,
        },
      });
      unionId = union.id;
    } else if (!unionId) {
      throw new Error(
        "Child mode requires existingUnionId or secondParentId to define parent union",
      );
    }
    await prisma.childship.create({
      data: {
        unionId,
        childId: newPerson.id,
        relationshipType: data.relationshipType ?? "BIOLOGICAL",
      },
    });
  }

  return { personId: newPerson.id, familyCode };
}

export async function getRelationshipBetween(
  fromPersonId: string,
  toPersonId: string,
): Promise<RelationshipPath | null> {
  const [from, to] = await Promise.all([
    prisma.person.findUnique({ where: { id: fromPersonId } }),
    prisma.person.findUnique({ where: { id: toPersonId } }),
  ]);
  if (!from || !to) return null;

  const people = await prisma.person.findMany();
  const unions = await loadAllUnions();
  return computeRelationshipPath(from, to, people, unions);
}

export async function listMembersForPicker(): Promise<SearchResult[]> {
  const people = await prisma.person.findMany({
    take: 100,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return people.map((p) => ({
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    birthYear: birthYearFromPerson(p),
  }));
}
