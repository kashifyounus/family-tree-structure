import { maternalWingPersonIds } from "./maternalWingIds";
import {
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_ROW_STEP,
} from "../pedigreeLayoutTokens";
import type {
  MarriageLayoutEdge,
  MarriageLayoutUnion,
} from "../marriageTreeLayout";

function parentsOf(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): string[] {
  const ids: string[] = [];
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    if (included.has(u.partner1Id)) ids.push(u.partner1Id);
    if (included.has(u.partner2Id)) ids.push(u.partner2Id);
  }
  return ids;
}

function siblingsOf(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): string[] {
  const sibs = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    for (const cs of u.childships) {
      if (cs.childId !== personId && included.has(cs.childId)) {
        sibs.add(cs.childId);
      }
    }
  }
  return [...sibs];
}

function unionForChild(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
): MarriageLayoutUnion | undefined {
  return unions.find((u) => u.childships.some((c) => c.childId === personId));
}

/**
 * Place cousins/collaterals still missing after the marriage-row layout (v6 polish).
 */
export function placeRemainingIncludedPersons(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  included: ReadonlySet<string>,
  unions: readonly MarriageLayoutUnion[],
  peopleById: Map<string, { id: string }>,
  marriageRowY: number,
  focalId: string,
  focalPartnerIds: readonly string[],
): void {
  const maternal = maternalWingPersonIds(
    focalId,
    focalPartnerIds,
    unions,
    included,
  );
  const H = PEDIGREE_COLUMN_STEP;
  const V = PEDIGREE_ROW_STEP;

  const maxRounds = included.size + 4;
  for (let round = 0; round < maxRounds; round++) {
    const pending = [...included].filter((id) => !positions.has(id));
    if (pending.length === 0) break;

    let progress = false;
    for (const personId of pending) {
      if (!peopleById.has(personId)) continue;

      const placedParents = parentsOf(personId, unions, included).filter((p) =>
        positions.has(p),
      );
      if (placedParents.length > 0) {
        const parentId = placedParents[0];
        const parentPos = positions.get(parentId)!;
        const u = unionForChild(personId, unions);
        const sibsInUnion = u
          ? u.childships
              .map((c) => c.childId)
              .filter((id) => included.has(id))
          : [personId];
        const placedSibs = sibsInUnion.filter(
          (id) => id !== personId && positions.has(id),
        );
        const index = placedSibs.length;
        const wing = maternal.has(personId) ? 1 : -1;
        const x =
          parentPos.x +
          wing * (PEDIGREE_COLUMN_STEP / 2) +
          index * H * wing;
        const y = parentPos.y + V;
        positions.set(personId, { x, y });
        edges.push({
          id: `parent-${parentId}-${personId}-collateral`,
          source: parentId,
          target: personId,
          type: "parent",
        });
        progress = true;
        continue;
      }

      const placedSib = siblingsOf(personId, unions, included).find((s) =>
        positions.has(s),
      );
      if (placedSib) {
        const anchor = positions.get(placedSib)!;
        const wing = maternal.has(personId) ? 1 : -1;
        const offset = (maternal.has(placedSib) ? 1 : -1) === wing ? H : -H;
        positions.set(personId, { x: anchor.x + offset, y: anchor.y });
        edges.push({
          id: `sibling-${placedSib}-${personId}-collateral`,
          source: placedSib,
          target: personId,
          type: "sibling",
        });
        progress = true;
      }
    }

    if (!progress) break;
  }

  let stagger = 0;
  for (const personId of included) {
    if (positions.has(personId)) continue;
    if (!peopleById.has(personId)) continue;
    const wing = maternal.has(personId) ? 1 : -1;
    positions.set(personId, {
      x: stagger * H * wing,
      y: marriageRowY + V * 2,
    });
    stagger += 1;
  }
}
