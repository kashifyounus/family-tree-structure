import { PEDIGREE_CARD_BIG_W, PEDIGREE_ROW_STEP } from "../pedigreeLayoutTokens";
import type { MarriageLayoutUnion } from "../marriageTreeLayout";

function collectAncestors(
  startId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): Set<string> {
  const ancestors = new Set<string>();
  const queue = [startId];
  const seen = new Set<string>([startId]);
  while (queue.length > 0) {
    const personId = queue.pop()!;
    for (const u of unions) {
      if (!u.childships.some((c) => c.childId === personId)) continue;
      for (const parentId of [u.partner1Id, u.partner2Id]) {
        if (!included.has(parentId) || seen.has(parentId)) continue;
        seen.add(parentId);
        ancestors.add(parentId);
        queue.push(parentId);
      }
    }
  }
  return ancestors;
}

function parentGenerationsAbove(
  descendantId: string,
  ancestorId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): number | null {
  if (descendantId === ancestorId) return 0;
  const queue: { id: string; depth: number }[] = [{ id: descendantId, depth: 0 }];
  const seen = new Set<string>([descendantId]);
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    for (const u of unions) {
      if (!u.childships.some((c) => c.childId === id)) continue;
      for (const parentId of [u.partner1Id, u.partner2Id]) {
        if (!included.has(parentId)) continue;
        if (parentId === ancestorId) return depth + 1;
        if (!seen.has(parentId)) {
          seen.add(parentId);
          queue.push({ id: parentId, depth: depth + 1 });
        }
      }
    }
  }
  return null;
}

/**
 * When both marriage-row partners share an ancestor, merge to one card centered above the couple.
 */
export function reconcileSharedAncestors(
  positions: Map<string, { x: number; y: number }>,
  husbandId: string,
  wifeId: string | null,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
  marriageRowY: number,
): string[] {
  if (!wifeId) return [];

  const leftAnc = collectAncestors(husbandId, unions, included);
  const rightAnc = collectAncestors(wifeId, unions, included);
  const shared: string[] = [];
  for (const id of leftAnc) {
    if (rightAnc.has(id)) shared.push(id);
  }
  if (shared.length === 0) return [];

  const husbandX = positions.get(husbandId)?.x ?? 0;
  const wifeX = positions.get(wifeId)?.x ?? husbandX;
  const centerX =
    (Math.min(husbandX, wifeX) +
      Math.max(husbandX + PEDIGREE_CARD_BIG_W, wifeX + PEDIGREE_CARD_BIG_W)) /
      2 -
    PEDIGREE_CARD_BIG_W / 2;

  const merged: string[] = [];
  for (const ancestorId of shared) {
    const depthH = parentGenerationsAbove(husbandId, ancestorId, unions, included);
    const depthW = parentGenerationsAbove(wifeId, ancestorId, unions, included);
    const depth = Math.max(depthH ?? 0, depthW ?? 0);
    if (depth <= 0) continue;
    const rowY = marriageRowY - PEDIGREE_ROW_STEP * depth;
    positions.set(ancestorId, { x: centerX, y: rowY });
    merged.push(ancestorId);
  }

  return merged;
}
