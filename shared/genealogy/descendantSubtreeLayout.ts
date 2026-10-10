import {
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_ROW_STEP,
} from "../pedigreeLayoutTokens";
import type {
  MarriageLayoutEdge,
  MarriageLayoutPerson,
  MarriageLayoutUnion,
} from "../marriageTreeLayout";

function childrenOfPerson(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): string[] {
  const out: string[] = [];
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const cs of u.childships) {
      if (included.has(cs.childId)) out.push(cs.childId);
    }
  }
  return out;
}

function birthTime(p: MarriageLayoutPerson): number {
  if (!p.birthDate) return Number.POSITIVE_INFINITY;
  const d =
    p.birthDate instanceof Date ? p.birthDate : new Date(String(p.birthDate));
  const t = d.getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function sortByBirthOldestFirst(
  ids: string[],
  peopleById: Map<string, MarriageLayoutPerson>,
): string[] {
  return [...ids].sort((a, b) => {
    const pa = peopleById.get(a);
    const pb = peopleById.get(b);
    return birthTime(pa ?? { id: a }) - birthTime(pb ?? { id: b });
  });
}

/**
 * Place each person's descendants in a column under that person (not a shared sibling rail).
 */
export function placeDescendantSubtrees(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  included: ReadonlySet<string>,
  unions: readonly MarriageLayoutUnion[],
  peopleById: Map<string, MarriageLayoutPerson>,
  rootPersonIds: readonly string[],
  generationsDown: number,
): void {
  if (generationsDown <= 0) return;
  const H = PEDIGREE_COLUMN_STEP;
  const V = PEDIGREE_ROW_STEP;

  const placeGeneration = (parentIds: string[], depthLeft: number) => {
    if (depthLeft <= 0) return;
    const nextParents: string[] = [];

    for (const parentId of parentIds) {
      const parentPos = positions.get(parentId);
      if (!parentPos) continue;

      const kids = sortByBirthOldestFirst(
        childrenOfPerson(parentId, unions, included),
        peopleById,
      );
      if (kids.length === 0) continue;

      kids.forEach((childId, index) => {
        const x =
          parentPos.x + (index - (kids.length - 1) / 2) * H;
        const y = parentPos.y + V;
        const existing = positions.get(childId);
        if (!existing) {
          positions.set(childId, { x, y });
        } else if (existing.y >= parentPos.y) {
          positions.set(childId, { x, y });
        }
        const edgeId = `descendant-${parentId}-${childId}`;
        if (!edges.some((e) => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: parentId,
            target: childId,
            type: "child",
          });
        }
        nextParents.push(childId);
      });
    }

    if (nextParents.length > 0) {
      placeGeneration(nextParents, depthLeft - 1);
    }
  };

  placeGeneration([...rootPersonIds], generationsDown);
}
