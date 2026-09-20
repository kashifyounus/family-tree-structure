import type { Gender, Person } from "@prisma/client";
import type {
  KinshipRelative,
  RelationshipPath,
  RelationshipPathStep,
} from "@/types/family";
import { toPersonSummary } from "@/lib/personMapper";

export type PersonWithChildships = Person & {
  childships: {
    unionId: string;
    relationshipType: string;
    union: {
      id: string;
      partner1Id: string;
      partner2Id: string;
      partner1: Person;
      partner2: Person;
      childships: { childId: string; child: Person }[];
    };
  }[];
};

export type UnionRecord = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  partner1: Person;
  partner2: Person;
  childships: { childId: string; child: Person; relationshipType: string }[];
};

export function getParentIdsFromUnions(
  personId: string,
  unionsAsChild: PersonWithChildships["childships"],
): string[] {
  const parentIds = new Set<string>();
  for (const cs of unionsAsChild) {
    const { partner1Id, partner2Id } = cs.union;
    if (partner1Id !== personId) parentIds.add(partner1Id);
    if (partner2Id !== personId) parentIds.add(partner2Id);
  }
  return [...parentIds];
}

export function pickParentByGender(
  parentIds: string[],
  peopleById: Map<string, Person>,
  gender: Gender,
): Person | null {
  for (const id of parentIds) {
    const p = peopleById.get(id);
    if (p?.gender === gender) return p;
  }
  return null;
}

export type SiblingInfo = {
  person: Person;
  degree: "full" | "half" | "step";
  sharedUnionId?: string;
};

export function getSiblings(
  personId: string,
  unionsAsChild: PersonWithChildships["childships"],
  allUnions: UnionRecord[],
): SiblingInfo[] {
  const siblings = new Map<string, SiblingInfo>();

  for (const cs of unionsAsChild) {
    for (const other of cs.union.childships) {
      if (other.childId === personId) continue;
      siblings.set(other.childId, {
        person: other.child,
        degree: "full",
        sharedUnionId: cs.unionId,
      });
    }
  }

  const parentIds = getParentIdsFromUnions(personId, unionsAsChild);
  for (const union of allUnions) {
    const involvesParent = parentIds.some(
      (pid) => pid === union.partner1Id || pid === union.partner2Id,
    );
    if (!involvesParent) continue;

    for (const cs of union.childships) {
      if (cs.childId === personId) continue;
      if (siblings.has(cs.childId)) continue;

      const sharedParents = parentIds.filter((pid) => {
        return pid === union.partner1Id || pid === union.partner2Id;
      }).length;

      if (sharedParents === 1) {
        siblings.set(cs.childId, {
          person: cs.child,
          degree: cs.relationshipType === "STEP" ? "step" : "half",
          sharedUnionId: union.id,
        });
      }
    }
  }

  return [...siblings.values()];
}

function toKinship(
  person: Person,
  kinshipLabel: string,
  side: KinshipRelative["side"],
  degree: KinshipRelative["degree"],
): KinshipRelative {
  return {
    ...toPersonSummary(person),
    kinshipLabel,
    side,
    degree,
  };
}

export function computeAuntsAndUncles(
  personId: string,
  unionsAsChild: PersonWithChildships["childships"],
  allUnions: UnionRecord[],
  peopleById: Map<string, Person>,
): {
  paternalUncles: KinshipRelative[];
  paternalAunts: KinshipRelative[];
  maternalUncles: KinshipRelative[];
  maternalAunts: KinshipRelative[];
  fullSiblings: KinshipRelative[];
  halfSiblings: KinshipRelative[];
} {
  const parentIds = getParentIdsFromUnions(personId, unionsAsChild);
  const father = pickParentByGender(parentIds, peopleById, "MALE");
  const mother = pickParentByGender(parentIds, peopleById, "FEMALE");

  const paternalUncles: KinshipRelative[] = [];
  const paternalAunts: KinshipRelative[] = [];
  const maternalUncles: KinshipRelative[] = [];
  const maternalAunts: KinshipRelative[] = [];

  const classifyParentSibling = (
    sibling: SiblingInfo,
    side: "paternal" | "maternal",
  ): KinshipRelative => {
    const label =
      sibling.person.gender === "FEMALE"
        ? side === "paternal"
          ? "Paternal Aunt"
          : "Maternal Aunt"
        : side === "paternal"
          ? "Paternal Uncle"
          : "Maternal Uncle";
    return toKinship(sibling.person, label, side, sibling.degree);
  };

  if (father) {
    const fatherAsChildUnions = allUnions.filter((u) =>
      u.childships.some((c) => c.childId === father.id),
    );
    const fatherSiblings = getSiblings(
      father.id,
      fatherAsChildUnions.map((u) => ({
        unionId: u.id,
        relationshipType: "BIOLOGICAL",
        union: u,
      })),
      allUnions,
    );
    for (const s of fatherSiblings) {
      const rel = classifyParentSibling(s, "paternal");
      if (s.person.gender === "FEMALE") paternalAunts.push(rel);
      else paternalUncles.push(rel);
    }
  }

  if (mother) {
    const motherAsChildUnions = allUnions.filter((u) =>
      u.childships.some((c) => c.childId === mother.id),
    );
    const motherSiblings = getSiblings(
      mother.id,
      motherAsChildUnions.map((u) => ({
        unionId: u.id,
        relationshipType: "BIOLOGICAL",
        union: u,
      })),
      allUnions,
    );
    for (const s of motherSiblings) {
      const rel = classifyParentSibling(s, "maternal");
      if (s.person.gender === "FEMALE") maternalAunts.push(rel);
      else maternalUncles.push(rel);
    }
  }

  const ownSiblings = getSiblings(personId, unionsAsChild, allUnions);
  const fullSiblings: KinshipRelative[] = [];
  const halfSiblings: KinshipRelative[] = [];
  for (const s of ownSiblings) {
    const rel = toKinship(
      s.person,
      s.degree === "full" ? "Full Sibling" : "Half Sibling",
      "neutral",
      s.degree,
    );
    if (s.degree === "full") fullSiblings.push(rel);
    else halfSiblings.push(rel);
  }

  return {
    paternalUncles,
    paternalAunts,
    maternalUncles,
    maternalAunts,
    fullSiblings,
    halfSiblings,
  };
}

type AdjacencyEdge = { to: string; relation: string };

function buildAdjacency(
  people: Person[],
  unions: UnionRecord[],
): Map<string, AdjacencyEdge[]> {
  const adj = new Map<string, AdjacencyEdge[]>();
  const add = (from: string, to: string, relation: string) => {
    const list = adj.get(from) ?? [];
    list.push({ to, relation });
    adj.set(from, list);
  };

  for (const u of unions) {
    add(u.partner1Id, u.partner2Id, "spouse");
    add(u.partner2Id, u.partner1Id, "spouse");
    for (const cs of u.childships) {
      add(u.partner1Id, cs.childId, "parent");
      add(u.partner2Id, cs.childId, "parent");
      add(cs.childId, u.partner1Id, "child");
      add(cs.childId, u.partner2Id, "child");
    }
  }

  for (const p of people) {
    if (!adj.has(p.id)) adj.set(p.id, []);
  }
  return adj;
}

export function computeRelationshipPath(
  from: Person,
  to: Person,
  people: Person[],
  unions: UnionRecord[],
): RelationshipPath {
  if (from.id === to.id) {
    return {
      from: toPersonSummary(from),
      to: toPersonSummary(to),
      steps: [],
      summary: "Same person",
    };
  }

  const adj = buildAdjacency(people, unions);
  const queue: { id: string; path: RelationshipPathStep[] }[] = [
    { id: from.id, path: [] },
  ];
  const visited = new Set<string>([from.id]);
  const peopleById = new Map(people.map((p) => [p.id, p]));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current.id) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      const step: RelationshipPathStep = {
        fromId: current.id,
        toId: edge.to,
        relation: edge.relation,
      };
      const newPath = [...current.path, step];
      if (edge.to === to.id) {
        return {
          from: toPersonSummary(from),
          to: toPersonSummary(to),
          steps: newPath,
          summary: describePath(newPath, peopleById),
        };
      }
      visited.add(edge.to);
      queue.push({ id: edge.to, path: newPath });
    }
  }

  return {
    from: toPersonSummary(from),
    to: toPersonSummary(to),
    steps: [],
    summary: "No path found in the family graph",
  };
}

function describePath(
  steps: RelationshipPathStep[],
  peopleById: Map<string, Person>,
): string {
  const names = steps.map((s) => {
    const from = peopleById.get(s.fromId);
    const to = peopleById.get(s.toId);
    const fromName = from ? `${from.firstName}` : "?";
    const toName = to ? `${to.firstName}` : "?";
    return `${fromName} → (${s.relation}) → ${toName}`;
  });
  return names.join("; ");
}
