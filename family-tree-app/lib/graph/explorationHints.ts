import type { KinshipUnionRecord } from "@/lib/kinship/types";

function getParentIds(personId: string, unions: KinshipUnionRecord[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    if (u.partner1Id !== personId) ids.add(u.partner1Id);
    if (u.partner2Id !== personId) ids.add(u.partner2Id);
  }
  return [...ids];
}

function getChildIds(personId: string, unions: KinshipUnionRecord[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const c of u.childships) ids.add(c.childId);
  }
  return [...ids];
}

function siblingsOf(personId: string, unions: KinshipUnionRecord[]): string[] {
  const parentUnions = unions.filter((u) =>
    u.childships.some((c) => c.childId === personId),
  );
  const sibs = new Set<string>();
  for (const u of parentUnions) {
    for (const c of u.childships) {
      if (c.childId !== personId) sibs.add(c.childId);
    }
  }
  return [...sibs];
}

export function getExplorationHints(
  personId: string,
  visibleIds: Set<string>,
  unions: KinshipUnionRecord[],
): {
  hasUnexpandedParents: boolean;
  hasUnexpandedChildren: boolean;
  hasUnexpandedSiblings: boolean;
} {
  const parentIds = getParentIds(personId, unions);
  const childIds = getChildIds(personId, unions);

  const hasUnexpandedParents =
    parentIds.length > 0 &&
    (parentIds.some((id) => !visibleIds.has(id)) ||
      parentIds.some((pid) => {
        const gp = getParentIds(pid, unions);
        return gp.some((id) => !visibleIds.has(id));
      }));

  const hasUnexpandedChildren =
    childIds.length > 0 && childIds.some((id) => !visibleIds.has(id));

  const sibIds = siblingsOf(personId, unions);
  const hasUnexpandedSiblings =
    sibIds.length > 0 && sibIds.some((id) => !visibleIds.has(id));

  return {
    hasUnexpandedParents,
    hasUnexpandedChildren,
    hasUnexpandedSiblings,
  };
}

export function focalHasUnexpandedSiblings(
  focalId: string,
  visibleIds: Set<string>,
  unions: KinshipUnionRecord[],
  siblingSteps: number,
): boolean {
  if (siblingSteps > 0) {
    const focalUnions = unions.filter(
      (u) => u.partner1Id === focalId || u.partner2Id === focalId,
    );
    const ring = new Set<string>();
    for (const id of siblingsOf(focalId, unions)) ring.add(id);
    for (const u of focalUnions) {
      const spouseId =
        u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
      for (const id of siblingsOf(spouseId, unions)) ring.add(id);
    }
    return [...ring].some((id) => !visibleIds.has(id));
  }
  return (
    siblingsOf(focalId, unions).some((id) => !visibleIds.has(id)) ||
    unions
      .filter((u) => u.partner1Id === focalId || u.partner2Id === focalId)
      .some((u) => {
        const spouseId =
          u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
        return siblingsOf(spouseId, unions).some((id) => !visibleIds.has(id));
      })
  );
}
