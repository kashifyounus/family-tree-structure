"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateFamilyCode } from "@/lib/familyCode";
import { buildHusbandFamilyReport } from "@/lib/household";
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
  maskUnionSummary,
} from "@/lib/privacy";
import { birthYearFromPerson, toPersonSummary } from "@/lib/personMapper";
import { loadRuleGraph } from "@/lib/ruleGraph";
import {
  assertCanAssignParents,
  assertCanAttachChild,
  assertCanCreateMarriage,
  assertLifeDates,
  assertMarriageTimeline,
  assertPersonDatesAgainstMarriages,
  canonicalPartnerIds,
  findMarriage,
  ruleMessages,
} from "@/shared/relationshipRules";
import type {
  CreatePersonAndUnionInput,
  FamilyGraph,
  LinkExistingChildInput,
  LinkExistingSpouseInput,
  MarriageRecord,
  PersonDetails,
  RelationshipPath,
  SearchResult,
  CreateStandalonePersonInput,
  DashboardMember,
  SetParentsInput,
  UpdatePersonInput,
  UpdateUnionInput,
} from "@/types/family";
import type { Person, Prisma, RelationshipType } from "@prisma/client";

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

function mapUnionToSummary(
  u: {
    id: string;
    partner1: Person;
    partner2: Person;
    marriageDate: Date | null;
    divorceDate: Date | null;
    isActive: boolean;
    children: {
      child: Person;
      relationshipType: string;
    }[];
  },
) {
  return {
    id: u.id,
    partner1: toPersonSummary(u.partner1),
    partner2: toPersonSummary(u.partner2),
    marriageDate: u.marriageDate?.toISOString() ?? null,
    divorceDate: u.divorceDate?.toISOString() ?? null,
    isActive: u.isActive,
    children: u.children.map((c) => ({
      ...toPersonSummary(c.child),
      relationshipType: c.relationshipType as RelationshipType,
      unionId: u.id,
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
              children: { include: { child: true } },
            },
          },
        },
      },
      unionsAsPartner1: {
        include: {
          partner1: true,
          partner2: true,
          children: { include: { child: true } },
        },
        orderBy: { marriageDate: "asc" },
      },
      unionsAsPartner2: {
        include: {
          partner1: true,
          partner2: true,
          children: { include: { child: true } },
        },
        orderBy: { marriageDate: "asc" },
      },
    },
  });

  if (!person) return null;

  const unionMap = new Map<
    string,
    (typeof person.unionsAsPartner1)[0]
  >();
  for (const u of [...person.unionsAsPartner1, ...person.unionsAsPartner2]) {
    unionMap.set(u.id, u);
  }

  const unions = [...unionMap.values()].map(mapUnionToSummary);
  const parentLinks = person.childships.map((childship) => ({
    childshipId: childship.id,
    unionId: childship.unionId,
    relationshipType: childship.relationshipType,
    partners: [
      toPersonSummary(childship.union.partner1),
      toPersonSummary(childship.union.partner2),
    ],
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

  const husbandUnions = await prisma.union.findMany({
    where: {
      OR: [{ partner1Id: person.id }, { partner2Id: person.id }],
    },
    include: {
      partner1: true,
      partner2: true,
      children: { include: { child: true } },
    },
    orderBy: { marriageDate: "asc" },
  });
  const household = buildHusbandFamilyReport(person, husbandUnions);

  const details: PersonDetails = {
    person: toPersonSummary(person),
    unions,
    parentLinks,
    computed,
    household,
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
  depth = 2,
  siblingSteps = 0,
): Promise<FamilyGraph | null> {
  const focal = await prisma.person.findUnique({ where: { familyCode } });
  if (!focal) return null;

  const unions = await loadAllUnions();
  const included = collectIncludedPersonIds(
    focal.id,
    unions,
    depth,
    depth,
    siblingSteps,
  );
  const people = await prisma.person.findMany({
    where: { id: { in: [...included] } },
  });
  const graph = buildFamilyGraph(
    focal,
    people,
    unions,
    depth,
    depth,
    siblingSteps,
  );
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

export async function expandFamilyGraphFromPerson(
  personId: string,
  familyCode: string,
): Promise<FamilyGraph | null> {
  const graph = await getFamilyGraph(familyCode, 2);
  if (!graph) return null;
  const node = graph.nodes.find((n) => n.id === personId);
  if (!node) return graph;
  return expandFamilyGraph(
    personId,
    "both",
    node.position,
    graph,
  );
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
          { nickname: { contains: trimmed, mode: "insensitive" } },
          { urduFirstName: { contains: trimmed, mode: "insensitive" } },
          { urduLastName: { contains: trimmed, mode: "insensitive" } },
          {
            AND: trimmed.split(/\s+/).map((part) => ({
              OR: [
                { firstName: { contains: part, mode: "insensitive" } },
                { lastName: { contains: part, mode: "insensitive" } },
                { urduFirstName: { contains: part, mode: "insensitive" } },
                { urduLastName: { contains: part, mode: "insensitive" } },
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
    nickname: p.nickname,
    urduFirstName: p.urduFirstName,
    urduLastName: p.urduLastName,
    birthYear: birthYearFromPerson(p),
  }));
}

function personCreateFields(
  data: CreatePersonAndUnionInput | CreateStandalonePersonInput,
) {
  return {
    title: data.title,
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname,
    urduFirstName: data.urduFirstName,
    urduLastName: data.urduLastName,
    gender: data.gender,
    birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
    photoUrl: data.photoUrl,
    bio: data.bio,
    occupation: data.occupation,
    motherTongue: data.motherTongue,
    birthPlace: data.birthPlace,
    currentCity: data.currentCity,
    permanentCity: data.permanentCity,
    homeTown: data.homeTown,
    privacyLevel: "privacyLevel" in data ? data.privacyLevel : undefined,
  };
}

export async function createPersonAndUnion(
  data: CreatePersonAndUnionInput,
): Promise<{ personId: string; familyCode: string }> {
  await requireEditor();

  const familyCode = await uniqueFamilyCode();

  const related = await prisma.person.findUnique({
    where: { id: data.relatedPersonId },
  });
  if (!related) {
    throw new Error(ruleMessages.notFound);
  }

  assertLifeDates(data.birthDate, data.deathDate);
  const graph = await loadRuleGraph();

  if (data.mode === "spouse") {
    assertMarriageTimeline({
      marriageDate: data.marriageDate,
      births: [related.birthDate?.toISOString(), data.birthDate],
      deaths: [related.deathDate?.toISOString(), data.deathDate],
    });
  } else if (!data.existingUnionId && data.secondParentId) {
    assertCanCreateMarriage(graph, related.id, data.secondParentId, undefined);
  } else if (!data.existingUnionId) {
    throw new Error(
      "Choose a marriage or the other parent before recording a child.",
    );
  } else if (!graph.unions.some((union) => union.id === data.existingUnionId)) {
    throw new Error(ruleMessages.marriageMissing);
  } else {
    const chosen = graph.unions.find((union) => union.id === data.existingUnionId);
    if (
      chosen &&
      chosen.partner1Id !== related.id &&
      chosen.partner2Id !== related.id
    ) {
      throw new Error("Choose a marriage that includes this person.");
    }
  }

  const newPerson = await prisma.person.create({
    data: {
      familyCode,
      ...personCreateFields(data),
    },
  });

  if (data.mode === "spouse") {
    const [partner1Id, partner2Id] = canonicalPartnerIds(
      related.id,
      newPerson.id,
    );
    await prisma.union.create({
      data: {
        partner1Id,
        partner2Id,
        marriageDate: data.marriageDate
          ? new Date(data.marriageDate)
          : undefined,
        isActive: true,
      },
    });
  } else {
    let unionId = data.existingUnionId;
    if (!unionId && data.secondParentId) {
      const [partner1Id, partner2Id] = canonicalPartnerIds(
        related.id,
        data.secondParentId,
      );
      const union = await prisma.union.create({
        data: {
          partner1Id,
          partner2Id,
          isActive: true,
        },
      });
      unionId = union.id;
    } else if (!unionId) {
      throw new Error(
        "Choose a marriage or the other parent before recording a child.",
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

  revalidatePath("/dashboard");
  revalidatePath(`/tree/${related.familyCode}`);
  revalidatePath(`/tree/${familyCode}`);
  revalidatePath(`/tree/${related.familyCode}/reports`);

  return { personId: newPerson.id, familyCode };
}

export async function updatePerson(
  input: UpdatePersonInput,
): Promise<{ familyCode: string }> {
  await requireEditor();

  const existing = await prisma.person.findUnique({
    where: { id: input.personId },
  });
  if (!existing) throw new Error(ruleMessages.notFound);

  const nextBirth =
    input.birthDate === null
      ? null
      : input.birthDate
        ? input.birthDate
        : existing.birthDate?.toISOString();
  const nextDeath =
    input.deathDate === null
      ? null
      : input.deathDate
        ? input.deathDate
        : existing.deathDate?.toISOString();
  const graph = await loadRuleGraph();
  assertPersonDatesAgainstMarriages(graph, existing.id, nextBirth, nextDeath);

  await prisma.person.update({
    where: { id: input.personId },
    data: {
      title: input.title,
      firstName: input.firstName,
      lastName: input.lastName,
      nickname: input.nickname,
      urduFirstName: input.urduFirstName,
      urduLastName: input.urduLastName,
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
      occupation: input.occupation,
      motherTongue: input.motherTongue,
      privacyLevel: input.privacyLevel,
      birthPlace: input.birthPlace,
      currentCity: input.currentCity,
      permanentCity: input.permanentCity,
      homeTown: input.homeTown,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/tree/${existing.familyCode}`);
  revalidatePath(`/tree/${existing.familyCode}/reports`);
  return { familyCode: existing.familyCode };
}

export async function updateUnion(input: UpdateUnionInput): Promise<void> {
  await requireEditor();

  const union = await prisma.union.findUnique({
    where: { id: input.unionId },
    include: { partner1: true },
  });
  if (!union) throw new Error(ruleMessages.marriageMissing);

  const graph = await loadRuleGraph();
  const current = graph.unions.find((item) => item.id === input.unionId);
  const partner1 = graph.people.find((person) => person.id === union.partner1Id);
  const partner2 = graph.people.find((person) => person.id === union.partner2Id);
  assertMarriageTimeline({
    marriageDate:
      input.marriageDate === undefined
        ? current?.marriageDate
        : input.marriageDate,
    divorceDate:
      input.divorceDate === undefined ? current?.divorceDate : input.divorceDate,
    births: [partner1?.birthDate, partner2?.birthDate],
    deaths: [partner1?.deathDate, partner2?.deathDate],
  });

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

export async function listMembersForDashboard(
  query = "",
  limit = 50,
): Promise<DashboardMember[]> {
  const trimmed = query.trim();
  const people = await prisma.person.findMany({
    where: trimmed
      ? {
          OR: [
            { familyCode: { contains: trimmed, mode: "insensitive" } },
            { firstName: { contains: trimmed, mode: "insensitive" } },
            { lastName: { contains: trimmed, mode: "insensitive" } },
            { nickname: { contains: trimmed, mode: "insensitive" } },
            { urduFirstName: { contains: trimmed, mode: "insensitive" } },
            { urduLastName: { contains: trimmed, mode: "insensitive" } },
          ],
        }
      : undefined,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
  });

  return people.map((p) => ({
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    nickname: p.nickname,
    urduFirstName: p.urduFirstName,
    urduLastName: p.urduLastName,
    birthYear: birthYearFromPerson(p),
    gender: p.gender,
    currentCity: p.currentCity,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function createStandalonePerson(
  data: CreateStandalonePersonInput,
): Promise<{ personId: string; familyCode: string }> {
  await requireEditor();

  assertLifeDates(data.birthDate, data.deathDate);
  const familyCode = await uniqueFamilyCode();
  const newPerson = await prisma.person.create({
    data: {
      familyCode,
      ...personCreateFields(data),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/tree/${familyCode}`);

  return { personId: newPerson.id, familyCode };
}

export async function deletePerson(personId: string): Promise<void> {
  await requireEditor();

  const existing = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      unionsAsPartner1: { include: { children: true } },
      unionsAsPartner2: { include: { children: true } },
      childships: true,
    },
  });
  if (!existing) throw new Error(ruleMessages.notFound);

  const unionChildCount =
    existing.unionsAsPartner1.reduce((n, u) => n + u.children.length, 0) +
    existing.unionsAsPartner2.reduce((n, u) => n + u.children.length, 0);

  if (unionChildCount > 0) {
    throw new Error(
      "This person cannot be removed because they are linked to children in a marriage.",
    );
  }

  if (existing.childships.length > 0) {
    throw new Error(
      "This person cannot be removed because they are recorded as a child in a marriage.",
    );
  }

  const familyCode = existing.familyCode;
  await prisma.person.delete({ where: { id: personId } });

  revalidatePath("/dashboard");
  revalidatePath(`/tree/${familyCode}`);
  revalidatePath(`/tree/${familyCode}/reports`);
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
    nickname: p.nickname,
    urduFirstName: p.urduFirstName,
    urduLastName: p.urduLastName,
    birthYear: birthYearFromPerson(p),
  }));
}

export async function listUnionOptionsForPerson(
  personId: string,
): Promise<{ id: string; label: string }[]> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      unionsAsPartner1: {
        include: { partner1: true, partner2: true },
        orderBy: { marriageDate: "asc" },
      },
      unionsAsPartner2: {
        include: { partner1: true, partner2: true },
        orderBy: { marriageDate: "asc" },
      },
    },
  });
  if (!person) return [];

  const unions = [...person.unionsAsPartner1, ...person.unionsAsPartner2];
  return unions.map((u, index) => {
    const other =
      u.partner1Id === personId ? u.partner2 : u.partner1;
    const year = u.marriageDate?.getFullYear();
    return {
      id: u.id,
      label: `${person.firstName} & ${other.firstName}${year ? ` (${year})` : ""} · marriage ${index + 1}`,
    };
  });
}

function revalidatePerson(familyCode: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/tree/${familyCode}`);
  revalidatePath(`/tree/${familyCode}/reports`);
  revalidatePath(`/people`);
}

export async function getMarriage(
  unionId: string,
): Promise<MarriageRecord | null> {
  const viewer = await getAuthContext();
  const union = await prisma.union.findUnique({
    where: { id: unionId },
    include: {
      partner1: true,
      partner2: true,
      children: { include: { child: true } },
    },
  });
  if (!union) return null;
  return maskUnionSummary(mapUnionToSummary(union), viewer);
}

export async function linkExistingSpouse(
  input: LinkExistingSpouseInput,
): Promise<{ unionId: string }> {
  await requireEditor();
  const graph = await loadRuleGraph();
  assertCanCreateMarriage(
    graph,
    input.personId,
    input.spouseId,
    input.marriageDate,
  );
  const [partner1Id, partner2Id] = canonicalPartnerIds(
    input.personId,
    input.spouseId,
  );
  const union = await prisma.union.create({
    data: {
      partner1Id,
      partner2Id,
      marriageDate: input.marriageDate
        ? new Date(input.marriageDate)
        : undefined,
      isActive: true,
    },
    include: { partner1: true, partner2: true },
  });
  revalidatePerson(union.partner1.familyCode);
  revalidatePerson(union.partner2.familyCode);
  revalidatePath(`/marriages/${union.id}`);
  revalidatePath(`/people/${input.personId}`);
  revalidatePath(`/people/${input.spouseId}`);
  return { unionId: union.id };
}

export async function linkExistingChild(
  input: LinkExistingChildInput,
): Promise<void> {
  await requireEditor();
  const graph = await loadRuleGraph();
  assertCanAttachChild(graph, input.unionId, input.childId);
  await prisma.childship.create({
    data: {
      unionId: input.unionId,
      childId: input.childId,
      relationshipType: input.relationshipType ?? "BIOLOGICAL",
    },
  });
  const union = await prisma.union.findUnique({
    where: { id: input.unionId },
    include: { partner1: true },
  });
  if (union) {
    revalidatePerson(union.partner1.familyCode);
    revalidatePath(`/marriages/${union.id}`);
  }
  revalidatePath(`/people/${input.childId}`);
}

export async function setParents(input: SetParentsInput): Promise<{ unionId: string }> {
  await requireEditor();
  const graph = await loadRuleGraph();
  assertCanAssignParents(
    graph,
    input.personId,
    input.parentAId,
    input.parentBId,
  );

  let unionId = findMarriage(graph, input.parentAId, input.parentBId)?.id;
  if (!unionId) {
    assertCanCreateMarriage(graph, input.parentAId, input.parentBId, undefined);
    const [partner1Id, partner2Id] = canonicalPartnerIds(
      input.parentAId,
      input.parentBId,
    );
    const created = await prisma.union.create({
      data: { partner1Id, partner2Id, isActive: true },
    });
    unionId = created.id;
  }

  const relationshipType = input.relationshipType ?? "BIOLOGICAL";
  const existing = input.childshipId
    ? await prisma.childship.findUnique({ where: { id: input.childshipId } })
    : await prisma.childship.findFirst({
        where: { childId: input.personId },
        orderBy: { id: "asc" },
      });

  if (existing && existing.childId !== input.personId) {
    throw new Error(ruleMessages.saveRelationship);
  }

  const alreadyOnTarget = await prisma.childship.findUnique({
    where: {
      unionId_childId: { unionId, childId: input.personId },
    },
  });

  if (existing && existing.unionId === unionId) {
    await prisma.childship.update({
      where: { id: existing.id },
      data: { relationshipType },
    });
  } else if (existing && alreadyOnTarget) {
    await prisma.childship.delete({ where: { id: existing.id } });
    await prisma.childship.update({
      where: { id: alreadyOnTarget.id },
      data: { relationshipType },
    });
  } else if (existing) {
    await prisma.childship.update({
      where: { id: existing.id },
      data: { unionId, relationshipType },
    });
  } else if (alreadyOnTarget) {
    await prisma.childship.update({
      where: { id: alreadyOnTarget.id },
      data: { relationshipType },
    });
  } else {
    await prisma.childship.create({
      data: {
        unionId,
        childId: input.personId,
        relationshipType,
      },
    });
  }

  const child = await prisma.person.findUnique({ where: { id: input.personId } });
  if (child) revalidatePerson(child.familyCode);
  revalidatePath(`/people/${input.personId}`);
  revalidatePath(`/marriages/${unionId}`);
  return { unionId };
}
