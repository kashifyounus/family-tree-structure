"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateFamilyCode } from "@/lib/familyCode";
import {
  buildExpansionSubgraph,
  buildFamilyGraph,
  collectIncludedPersonIds,
} from "@/lib/graphLayout";
import { mergeFamilyGraphs } from "@/lib/graphMerge";
import {
  computeAuntsAndUncles,
  computeRelationshipPath,
  type UnionRecord,
} from "@/lib/kinship";
import { canEditTree } from "@/lib/auth";
import { getAuthContext } from "@/lib/auth.server";
import {
  maskPersonDetails,
  maskPersonSummary,
} from "@/lib/privacy";
import { birthYearFromPerson, toPersonSummary } from "@/lib/personMapper";
import type {
  CreatePersonAndUnionInput,
  FamilyGraph,
  PersonDetails,
  RelationshipPath,
  SearchResult,
  UpdatePersonInput,
  UpdateUnionInput,
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

async function loadPeopleForFocal(
  focalId: string,
  unions: UnionRecord[],
  generationsUp: number,
  generationsDown: number,
): Promise<Person[]> {
  const included = collectIncludedPersonIds(
    focalId,
    unions,
    generationsUp,
    generationsDown,
  );
  return prisma.person.findMany({
    where: { id: { in: [...included] } },
  });
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

async function requireEditor(): Promise<void> {
  const auth = await getAuthContext();
  if (!canEditTree(auth.role)) {
    throw new Error("You do not have permission to modify this tree.");
  }
}

async function maskGraph(graph: FamilyGraph): Promise<FamilyGraph> {
  const viewer = await getAuthContext();
  return {
    ...graph,
    nodes: graph.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        person: n.data.person
          ? maskPersonSummary(n.data.person, viewer)
          : undefined,
      },
    })),
  };
}

export async function getPersonDetails(
  personId: string,
): Promise<PersonDetails | null> {
  const viewer = await getAuthContext();

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

  const details: PersonDetails = {
    person: toPersonSummary(person),
    unions,
    computed,
  };

  return maskPersonDetails(details, viewer);
}

export async function getPersonDetailsByFamilyCode(
  familyCode: string,
): Promise<PersonDetails | null> {
  const person = await prisma.person.findUnique({ where: { familyCode } });
  if (!person) return null;
  return getPersonDetails(person.id);
}

export async function getFamilyGraph(
  familyCode: string,
): Promise<FamilyGraph | null> {
  const focal = await prisma.person.findUnique({ where: { familyCode } });
  if (!focal) return null;

  const unions = await loadAllUnions();
  const people = await loadPeopleForFocal(focal.id, unions, 2, 2);
  const graph = buildFamilyGraph(focal, people, unions, 2, 2);
  return maskGraph(graph);
}

export async function expandFamilyGraph(
  anchorPersonId: string,
  direction: "up" | "down" | "both",
  anchorPosition: { x: number; y: number },
  currentGraph: FamilyGraph,
): Promise<FamilyGraph | null> {
  const viewer = await getAuthContext();
  const anchor = await prisma.person.findUnique({
    where: { id: anchorPersonId },
  });
  if (!anchor) return null;

  const unions = await loadAllUnions();
  const included = collectIncludedPersonIds(anchor.id, unions, 2, 2);
  const people = await prisma.person.findMany({
    where: { id: { in: [...included] } },
  });

  const extension = buildExpansionSubgraph(
    anchor,
    people,
    unions,
    direction,
    anchorPosition,
  );

  const merged = mergeFamilyGraphs(currentGraph, extension);
  return {
    ...merged,
    nodes: merged.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        person: n.data.person
          ? maskPersonSummary(n.data.person, viewer)
          : undefined,
      },
    })),
  };
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
  await requireEditor();

  const familyCode = await uniqueFamilyCode();
  const birthDate = data.birthDate ? new Date(data.birthDate) : undefined;
  const deathDate = data.deathDate ? new Date(data.deathDate) : undefined;
  const isLiving =
    data.isLiving ?? (data.deathDate ? false : true);

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
      photoUrl: data.photoUrl,
      bio: data.bio,
      isLiving,
    },
  });

  if (data.mode === "spouse") {
    const spouseCount = await prisma.union.count({
      where: {
        OR: [{ partner1Id: related.id }, { partner2Id: related.id }],
      },
    });
    await prisma.union.create({
      data: {
        partner1Id: related.id,
        partner2Id: newPerson.id,
        marriageDate: data.marriageDate
          ? new Date(data.marriageDate)
          : undefined,
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

  revalidatePath(`/tree/${related.familyCode}`);
  revalidatePath(`/tree/${familyCode}`);

  return { personId: newPerson.id, familyCode };
}

export async function updatePerson(
  input: UpdatePersonInput,
): Promise<{ familyCode: string }> {
  await requireEditor();

  const existing = await prisma.person.findUnique({
    where: { id: input.personId },
  });
  if (!existing) throw new Error("Person not found");

  await prisma.person.update({
    where: { id: input.personId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      birthDate:
        input.birthDate === null
          ? null
          : input.birthDate
            ? new Date(input.birthDate)
            : undefined,
      deathDate:
        input.deathDate === null
          ? null
          : input.deathDate
            ? new Date(input.deathDate)
            : undefined,
      photoUrl: input.photoUrl,
      bio: input.bio,
      isLiving: input.isLiving,
      privacyLevel: input.privacyLevel,
    },
  });

  revalidatePath(`/tree/${existing.familyCode}`);
  return { familyCode: existing.familyCode };
}

export async function updateUnion(input: UpdateUnionInput): Promise<void> {
  await requireEditor();

  const union = await prisma.union.findUnique({
    where: { id: input.unionId },
    include: { partner1: true },
  });
  if (!union) throw new Error("Union not found");

  await prisma.union.update({
    where: { id: input.unionId },
    data: {
      marriageDate:
        input.marriageDate === null
          ? null
          : input.marriageDate
            ? new Date(input.marriageDate)
            : undefined,
      divorceDate:
        input.divorceDate === null
          ? null
          : input.divorceDate
            ? new Date(input.divorceDate)
            : undefined,
      isActive: input.isActive,
      sequenceOrder: input.sequenceOrder,
    },
  });

  revalidatePath(`/tree/${union.partner1.familyCode}`);
}

export async function getRelationshipBetween(
  fromPersonId: string,
  toPersonId: string,
): Promise<RelationshipPath | null> {
  const viewer = await getAuthContext();
  const [from, to] = await Promise.all([
    prisma.person.findUnique({ where: { id: fromPersonId } }),
    prisma.person.findUnique({ where: { id: toPersonId } }),
  ]);
  if (!from || !to) return null;

  const people = await prisma.person.findMany();
  const unions = await loadAllUnions();
  const path = computeRelationshipPath(from, to, people, unions);
  return {
    ...path,
    from: maskPersonSummary(path.from, viewer),
    to: maskPersonSummary(path.to, viewer),
  };
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

export async function listUnionOptionsForPerson(
  personId: string,
): Promise<{ id: string; label: string }[]> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      unionsAsPartner1: { include: { partner1: true, partner2: true } },
      unionsAsPartner2: { include: { partner1: true, partner2: true } },
    },
  });
  if (!person) return [];

  const unions = [...person.unionsAsPartner1, ...person.unionsAsPartner2];
  return unions.map((u) => {
    const other =
      u.partner1Id === personId ? u.partner2 : u.partner1;
    return {
      id: u.id,
      label: `${person.firstName} & ${other.firstName} (union #${u.sequenceOrder + 1})`,
    };
  });
}
