import type { UnionRecord } from "@/lib/kinship";

export function getParentIds(personId: string, unions: UnionRecord[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    if (u.partner1Id !== personId) ids.add(u.partner1Id);
    if (u.partner2Id !== personId) ids.add(u.partner2Id);
  }
  return [...ids];
}

export function getChildIds(personId: string, unions: UnionRecord[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const c of u.childships) ids.add(c.childId);
  }
  return [...ids];
}

function siblingsOf(personId: string, unions: UnionRecord[]): string[] {
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
  unions: UnionRecord[],
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
