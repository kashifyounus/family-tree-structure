import type { Gender } from "@/lib/data/types";
import type {
  ChildUnionContext,
  ComputedRelations,
  KinshipPerson,
  KinshipRelative,
  KinshipUnionRecord,
} from "@/lib/kinship/types";

function childUnionContext(
  u: KinshipUnionRecord,
  personId: string,
): ChildUnionContext {
  const childship = u.childships.find((c) => c.childId === personId);
  return {
    unionId: u.id,
    relationshipType: childship?.relationshipType ?? "BIOLOGICAL",
    union: {
      id: u.id,
      partner1Id: u.partner1Id,
      partner2Id: u.partner2Id,
      partner1: u.partner1,
      partner2: u.partner2,
      children: u.childships.map((c) => ({
        childId: c.childId,
        child: c.child,
      })),
    },
  };
}

export function getParentIdsFromUnions(
  personId: string,
  unionsAsChild: ChildUnionContext[],
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
  peopleById: Map<string, KinshipPerson>,
  gender: Gender,
): KinshipPerson | null {
  for (const id of parentIds) {
    const p = peopleById.get(id);
    if (p?.gender === gender) return p;
  }
  return null;
}

type SiblingInfo = {
  person: KinshipPerson;
  degree: "full" | "half" | "step";
  sharedUnionId?: string;
};

export function getSiblings(
  personId: string,
  unionsAsChild: ChildUnionContext[],
  allUnions: KinshipUnionRecord[],
): SiblingInfo[] {
  const siblings = new Map<string, SiblingInfo>();

  for (const cs of unionsAsChild) {
    for (const other of cs.union.children) {
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
  person: KinshipPerson,
  kinshipLabel: string,
  side: KinshipRelative["side"],
  degree: KinshipRelative["degree"],
): KinshipRelative {
  return { ...person, kinshipLabel, side, degree };
}

export function computeKinshipForPerson(
  personId: string,
  unionsAsChild: ChildUnionContext[],
  allUnions: KinshipUnionRecord[],
  peopleById: Map<string, KinshipPerson>,
): ComputedRelations {
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
          ? "Paternal aunt"
          : "Maternal aunt"
        : side === "paternal"
          ? "Paternal uncle"
          : "Maternal uncle";
    return toKinship(sibling.person, label, side, sibling.degree);
  };

  if (father) {
    const fatherAsChildUnions = allUnions.filter((u) =>
      u.childships.some((c) => c.childId === father.id),
    );
    const fatherSiblings = getSiblings(
      father.id,
      fatherAsChildUnions.map((u) => childUnionContext(u, father.id)),
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
      motherAsChildUnions.map((u) => childUnionContext(u, mother.id)),
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
  const stepSiblings: KinshipRelative[] = [];
  for (const s of ownSiblings) {
    const kinshipLabel =
      s.degree === "full"
        ? "Full sibling"
        : s.degree === "step"
          ? "Step sibling"
          : "Half sibling";
    const rel = toKinship(s.person, kinshipLabel, "neutral", s.degree);
    if (s.degree === "full") fullSiblings.push(rel);
    else if (s.degree === "step") stepSiblings.push(rel);
    else halfSiblings.push(rel);
  }

  return {
    paternalUncles,
    paternalAunts,
    maternalUncles,
    maternalAunts,
    fullSiblings,
    halfSiblings,
    stepSiblings,
  };
}

export function getParentsForPerson(
  personId: string,
  unionsAsChild: ChildUnionContext[],
  peopleById: Map<string, KinshipPerson>,
): KinshipPerson[] {
  const ids = getParentIdsFromUnions(personId, unionsAsChild);
  return ids
    .map((id) => peopleById.get(id))
    .filter((p): p is KinshipPerson => !!p);
}
