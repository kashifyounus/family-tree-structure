import type { MarriageLayoutUnion } from "../marriageTreeLayout";

export const MAX_COUSIN_DEGREE = 12;

function parentIds(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    if (u.partner1Id !== personId) ids.add(u.partner1Id);
    if (u.partner2Id !== personId) ids.add(u.partner2Id);
  }
  return [...ids];
}

function siblingsOf(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
): string[] {
  const sibs = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    for (const cs of u.childships) {
      if (cs.childId !== personId) sibs.add(cs.childId);
    }
  }
  return [...sibs];
}

function childIds(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const cs of u.childships) ids.add(cs.childId);
  }
  return [...ids];
}

/** All ancestors exactly `depth` generations above `startId` (1 = parents). */
export function ancestorsAtGenerationDepth(
  startId: string,
  depth: number,
  unions: readonly MarriageLayoutUnion[],
): string[] {
  if (depth <= 0) return [startId];
  const seen = new Set<string>();
  const results = new Set<string>();

  function walk(personId: string, current: number): void {
    if (current === depth) {
      results.add(personId);
      return;
    }
    for (const pid of parentIds(personId, unions)) {
      const key = `${current + 1}-${pid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      walk(pid, current + 1);
    }
  }

  walk(startId, 0);
  return [...results];
}

function addDescendantsWithinDepth(
  rootId: string,
  maxDepth: number,
  unions: readonly MarriageLayoutUnion[],
  included: Set<string>,
): void {
  function walk(personId: string, depth: number, visited: Set<string>): void {
    if (depth > maxDepth || visited.has(personId)) return;
    visited.add(personId);
    included.add(personId);
    if (depth === maxDepth) return;
    for (const cid of childIds(personId, unions)) {
      walk(cid, depth + 1, visited);
    }
  }
  walk(rootId, 0, new Set());
}

/**
 * nth cousins: ancestor n generations above focal, that ancestor's siblings,
 * then descendants n generations below each sibling (same generation as focal when n matches).
 */
export function includeCousinsUpToDegree(
  focalId: string,
  unions: readonly MarriageLayoutUnion[],
  included: Set<string>,
  maxCousinDegree: number,
): void {
  const capped = Math.min(MAX_COUSIN_DEGREE, Math.max(0, maxCousinDegree));
  for (let degree = 1; degree <= capped; degree++) {
    const ancestors = ancestorsAtGenerationDepth(focalId, degree, unions);
    for (const ancestorId of ancestors) {
      for (const collateralId of siblingsOf(ancestorId, unions)) {
        included.add(collateralId);
        addDescendantsWithinDepth(collateralId, degree, unions, included);
      }
    }
  }
}
