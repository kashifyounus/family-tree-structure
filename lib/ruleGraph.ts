import "server-only";

import { prisma } from "@/lib/prisma";
import type { RuleGraph } from "@/shared/relationshipRules";

export async function loadRuleGraph(): Promise<RuleGraph> {
  const [people, unions, children] = await Promise.all([
    prisma.person.findMany({
      select: {
        id: true,
        gender: true,
        birthDate: true,
        deathDate: true,
      },
    }),
    prisma.union.findMany({
      select: {
        id: true,
        partner1Id: true,
        partner2Id: true,
        marriageDate: true,
        divorceDate: true,
      },
    }),
    prisma.childship.findMany({
      select: { unionId: true, childId: true },
    }),
  ]);

  const childIdsByUnion = new Map<string, string[]>();
  for (const child of children) {
    const list = childIdsByUnion.get(child.unionId) ?? [];
    list.push(child.childId);
    childIdsByUnion.set(child.unionId, list);
  }

  return {
    people: people.map((person) => ({
      id: person.id,
      gender: person.gender,
      birthDate: person.birthDate?.toISOString() ?? null,
      deathDate: person.deathDate?.toISOString() ?? null,
    })),
    unions: unions.map((union) => ({
      id: union.id,
      partner1Id: union.partner1Id,
      partner2Id: union.partner2Id,
      marriageDate: union.marriageDate?.toISOString() ?? null,
      divorceDate: union.divorceDate?.toISOString() ?? null,
      childIds: childIdsByUnion.get(union.id) ?? [],
    })),
  };
}
