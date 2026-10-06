import type { MarriageLayoutUnion } from "../marriageTreeLayout";

export const DEFAULT_TREE_GENERATIONS_UP = 2;
export const DEFAULT_TREE_GENERATIONS_DOWN = 2;
export const DEFAULT_TREE_SIBLING_STEPS = 0;

/** Safety cap for on-device layout performance. */
export const MAX_TREE_GENERATIONS = 14;
export const MAX_TREE_SIBLING_STEPS = 10;

export type TreeExpansionState = {
  generationsUp: number;
  generationsDown: number;
  siblingSteps: number;
};

export const DEFAULT_TREE_EXPANSION: TreeExpansionState = {
  generationsUp: DEFAULT_TREE_GENERATIONS_UP,
  generationsDown: DEFAULT_TREE_GENERATIONS_DOWN,
  siblingSteps: DEFAULT_TREE_SIBLING_STEPS,
};

export function clampTreeExpansion(
  state: TreeExpansionState,
): TreeExpansionState {
  return {
    generationsUp: Math.min(
      MAX_TREE_GENERATIONS,
      Math.max(0, state.generationsUp),
    ),
    generationsDown: Math.min(
      MAX_TREE_GENERATIONS,
      Math.max(0, state.generationsDown),
    ),
    siblingSteps: Math.min(
      MAX_TREE_SIBLING_STEPS,
      Math.max(0, state.siblingSteps),
    ),
  };
}

/** One tap: more ancestors, descendants, and collaterals (uncles, aunts, etc.). */
export function stepExpandTree(
  state: TreeExpansionState,
): TreeExpansionState {
  return clampTreeExpansion({
    generationsUp: state.generationsUp + 1,
    generationsDown: state.generationsDown + 1,
    siblingSteps: state.siblingSteps + 1,
  });
}

/** Larger jump toward an extended family view. */
export function stepExpandTreeLarge(
  state: TreeExpansionState,
): TreeExpansionState {
  return clampTreeExpansion({
    generationsUp: state.generationsUp + 3,
    generationsDown: state.generationsDown + 3,
    siblingSteps: state.siblingSteps + 2,
  });
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

function maxAncestorDepth(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  visited: Set<string>,
): number {
  if (visited.has(personId)) return 0;
  visited.add(personId);
  const parents = parentIds(personId, unions);
  if (parents.length === 0) return 0;
  return (
    1 +
    Math.max(
      ...parents.map((pid) => maxAncestorDepth(pid, unions, visited)),
      0,
    )
  );
}

function maxDescendantDepth(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  visited: Set<string>,
): number {
  if (visited.has(personId)) return 0;
  visited.add(personId);
  const children = childIds(personId, unions);
  if (children.length === 0) return 0;
  return (
    1 +
    Math.max(
      ...children.map((cid) => maxDescendantDepth(cid, unions, visited)),
      0,
    )
  );
}

export function maxReachableTreeExpansion(
  focalId: string,
  unions: readonly MarriageLayoutUnion[],
): TreeExpansionState {
  const up = maxAncestorDepth(focalId, unions, new Set());
  const down = maxDescendantDepth(focalId, unions, new Set());
  return clampTreeExpansion({
    generationsUp: up + 1,
    generationsDown: down + 1,
    siblingSteps: Math.min(MAX_TREE_SIBLING_STEPS, Math.max(up, down) + 1),
  });
}

export function expandTreeToMaximum(
  focalId: string,
  unions: readonly MarriageLayoutUnion[],
): TreeExpansionState {
  return maxReachableTreeExpansion(focalId, unions);
}

export function treeExpansionHasMore(
  focalId: string,
  unions: readonly MarriageLayoutUnion[],
  state: TreeExpansionState,
  includedPersonIds: Set<string>,
): boolean {
  const max = maxReachableTreeExpansion(focalId, unions);
  const clamped = clampTreeExpansion(state);
  if (
    clamped.generationsUp < max.generationsUp ||
    clamped.generationsDown < max.generationsDown ||
    clamped.siblingSteps < max.siblingSteps
  ) {
    return true;
  }
  for (const personId of includedPersonIds) {
    if (siblingsOf(personId, unions).some((id) => !includedPersonIds.has(id))) {
      return true;
    }
  }
  const parents = parentIds(focalId, unions);
  if (parents.some((id) => !includedPersonIds.has(id))) return true;
  for (const pid of parents) {
    const gp = parentIds(pid, unions);
    if (gp.some((id) => !includedPersonIds.has(id))) return true;
  }
  const children = childIds(focalId, unions);
  if (children.some((id) => !includedPersonIds.has(id))) return true;
  return false;
}
