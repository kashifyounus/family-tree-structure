import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_COUPLE_OFFSET,
  PEDIGREE_ROW_STEP,
} from "../pedigreeLayoutTokens";
import {
  resolveMarriagePartners,
  sortByBirthOldestFirst,
  type MarriageLayoutEdge,
  type MarriageLayoutPerson,
  type MarriageLayoutUnion,
} from "../marriageTreeLayout";
import { placeDescendantSubtrees } from "./descendantSubtreeLayout";

const ROW_Y_EPS = 3;

/**
 * Place each marriage-row sibling's spouse + children in a column under that couple
 * (avoids stacking all nieces/nephews on the focal union child rail).
 */
export function placeSiblingMarriageSubtrees(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  included: ReadonlySet<string>,
  unions: readonly MarriageLayoutUnion[],
  peopleById: Map<string, MarriageLayoutPerson>,
  marriageRowY: number,
  focalId: string,
  focalPartnerIds: readonly string[],
  generationsDown: number,
): void {
  const focalPos = positions.get(focalId);
  if (!focalPos) return;

  const focalSet = new Set<string>([focalId, ...focalPartnerIds]);
  const H = PEDIGREE_COLUMN_STEP;
  const V = PEDIGREE_ROW_STEP;
  const coupleStep = PEDIGREE_COUPLE_OFFSET;

  const marriageRowPeople = [...included].filter((id) => {
    const pos = positions.get(id);
    return pos && Math.abs(pos.y - marriageRowY) < ROW_Y_EPS;
  });

  for (const personId of marriageRowPeople) {
    if (focalSet.has(personId)) continue;

    const wingPos = positions.get(personId);
    if (!wingPos) continue;

    const isLeftWing = wingPos.x < focalPos.x - ROW_Y_EPS;
    const isRightWing = wingPos.x > focalPos.x + ROW_Y_EPS;

    const personUnions = unions.filter(
      (u) =>
        (u.partner1Id === personId || u.partner2Id === personId) &&
        u.childships.some((c) => included.has(c.childId)),
    );

    for (const u of personUnions) {
      const spouseId =
        u.partner1Id === personId ? u.partner2Id : u.partner1Id;
      if (!included.has(spouseId)) continue;

      const partners = resolveMarriagePartners(
        personId,
        spouseId,
        peopleById,
      );
      let husbandX: number;
      if (isLeftWing) {
        husbandX = wingPos.x - coupleStep;
      } else if (isRightWing) {
        husbandX = wingPos.x;
      } else {
        husbandX = wingPos.x;
      }

      const wifeX = husbandX + coupleStep;
      positions.set(partners.husbandId, { x: husbandX, y: marriageRowY });
      positions.set(partners.wifeId, { x: wifeX, y: marriageRowY });

      if (!edges.some((e) => e.type === "spouse" && e.label === u.id)) {
        edges.push({
          id: `spouse-wing-${u.id}`,
          source: partners.husbandId,
          target: partners.wifeId,
          type: "spouse",
          label: u.id,
        });
      }

      const children = sortByBirthOldestFirst(
        u.childships
          .map((c) => peopleById.get(c.childId))
          .filter((p): p is MarriageLayoutPerson => !!p && included.has(p.id)),
      );

      const leftX = Math.min(husbandX, wifeX);
      const rightX = Math.max(husbandX, wifeX) + PEDIGREE_CARD_BIG_W;
      const coupleMidCenter = (leftX + rightX) / 2;

      const childIds: string[] = [];
      children.forEach((child, index) => {
        const x =
          coupleMidCenter -
          PEDIGREE_CARD_SMALL_W / 2 +
          (index - (children.length - 1) / 2) * H;
        const y = marriageRowY + V;
        positions.set(child.id, { x, y });
        childIds.push(child.id);
        const parentSource =
          personId === partners.husbandId
            ? partners.husbandId
            : personId === partners.wifeId
              ? partners.wifeId
              : partners.husbandId;
        edges.push({
          id: `child-wing-${parentSource}-${child.id}-${u.id}`,
          source: parentSource,
          target: child.id,
          type: "child",
          label: u.id,
        });
      });

      if (childIds.length > 0 && generationsDown > 1) {
        placeDescendantSubtrees(
          positions,
          edges,
          included,
          unions,
          peopleById,
          childIds,
          generationsDown - 1,
        );
      }
    }
  }
}
