/**
 * Business rule: how much of the tree to load so a find-relation path fits on the canvas.
 */

export type MarriageUnionForPath = {
  partner1Id: string;
  partner2Id: string;
  childships: { childId: string }[];
};

function parentsOf(personId: string, unions: MarriageUnionForPath[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    ids.add(u.partner1Id);
    ids.add(u.partner2Id);
  }
  return [...ids];
}

function childrenOf(personId: string, unions: MarriageUnionForPath[]): string[] {
  const ids = new Set<string>();
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const cs of u.childships) ids.add(cs.childId);
  }
  return [...ids];
}

/** Shortest parent/child walk from `fromId` to `toId` (up = toward parents, down = toward children). */
export function shortestUpDownBetween(
  fromId: string,
  toId: string,
  unions: MarriageUnionForPath[],
): { up: number; down: number } {
  if (fromId === toId) return { up: 0, down: 0 };

  type State = { id: string; up: number; down: number };
  const seen = new Set<string>();
  const queue: State[] = [{ id: fromId, up: 0, down: 0 }];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const sig = `${cur.id}:${cur.up}:${cur.down}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    if (cur.id === toId) return { up: cur.up, down: cur.down };
    if (cur.up + cur.down >= 24) continue;

    for (const parentId of parentsOf(cur.id, unions)) {
      queue.push({ id: parentId, up: cur.up + 1, down: cur.down });
    }
    for (const childId of childrenOf(cur.id, unions)) {
      queue.push({ id: childId, up: cur.up, down: cur.down + 1 });
    }
  }

  return { up: 6, down: 6 };
}

export type KinshipPathGenerations = {
  generationsUp: number;
  generationsDown: number;
};

const MAX_GEN = 12;

/** Generations to include from view focal so every person on a relation path can appear on the graph. */
export function generationsToIncludeKinshipPath(
  focalPersonId: string,
  pathPersonIds: readonly string[],
  unions: MarriageUnionForPath[],
): KinshipPathGenerations {
  const unique = [...new Set(pathPersonIds.filter(Boolean))];
  let maxUp = 2;
  let maxDown = 2;
  for (const id of unique) {
    const { up, down } = shortestUpDownBetween(focalPersonId, id, unions);
    maxUp = Math.max(maxUp, up);
    maxDown = Math.max(maxDown, down);
  }
  return {
    generationsUp: Math.min(MAX_GEN, maxUp + 1),
    generationsDown: Math.min(MAX_GEN, maxDown + 1),
  };
}

export type KinshipPathTreeExpansion = KinshipPathGenerations & {
  siblingSteps: number;
  cousinDegree: number;
};

/** Full local tree expansion so find-relation paths (including distant cousins) fit on the graph. */
export function treeExpansionForKinshipPath(
  focalPersonId: string,
  pathPersonIds: readonly string[],
  unions: MarriageUnionForPath[],
): KinshipPathTreeExpansion {
  const gens = generationsToIncludeKinshipPath(
    focalPersonId,
    pathPersonIds,
    unions,
  );
  const unique = [...new Set(pathPersonIds.filter(Boolean))];
  let maxCousin = 0;
  let needsCollateral = false;
  for (const id of unique) {
    const { up, down } = shortestUpDownBetween(focalPersonId, id, unions);
    if (up >= 2 && down >= 2) {
      maxCousin = Math.max(maxCousin, Math.min(up, down) - 1);
      needsCollateral = true;
    }
    if (up >= 1 && down >= 1 && Math.min(up, down) === 1) {
      needsCollateral = true;
    }
  }
  return {
    ...gens,
    siblingSteps: needsCollateral ? Math.max(1, maxCousin) : 0,
    cousinDegree: Math.min(8, maxCousin),
  };
}
