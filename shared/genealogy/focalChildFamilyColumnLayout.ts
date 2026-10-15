import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_COUPLE_OFFSET,
  PEDIGREE_MIN_L_JOG,
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

function coupleMidFromHusbandX(husbandX: number): number {
  const wifeX = husbandX + PEDIGREE_COUPLE_OFFSET;
  const leftX = Math.min(husbandX, wifeX);
  const rightX = Math.max(husbandX, wifeX);
  return (leftX + rightX + PEDIGREE_CARD_BIG_W) / 2;
}

function husbandXForCoupleMid(coupleMidCenter: number): number {
  return coupleMidCenter - (PEDIGREE_COUPLE_OFFSET + PEDIGREE_CARD_BIG_W) / 2;
}

/** Width required for one focal child's column (spouse + descendant fans). */
export function measureFocalChildColumnWidth(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
  peopleById: Map<string, MarriageLayoutPerson>,
  generationsBelowChild: number,
): number {
  const H = PEDIGREE_COLUMN_STEP;
  const card = PEDIGREE_CARD_SMALL_W;
  const coupleSpan = PEDIGREE_COUPLE_OFFSET + PEDIGREE_CARD_BIG_W;

  if (generationsBelowChild <= 0) {
    return card;
  }

  const personUnions = unionsForPerson(personId, unions, included);
  let maxW = card;

  if (personUnions.length === 0) {
    const kids = sortByBirthOldestFirst(
      childrenOfPerson(personId, unions, included)
        .map((id) => peopleById.get(id))
        .filter((p): p is MarriageLayoutPerson => !!p),
    );
    maxW = Math.max(maxW, fanWidth(kids.length, H, card));
    for (const kid of kids) {
      maxW = Math.max(
        maxW,
        measureFocalChildColumnWidth(
          kid.id,
          unions,
          included,
          peopleById,
          generationsBelowChild - 1,
        ),
      );
    }
    return maxW;
  }

  for (const u of personUnions) {
    const spouseId =
      u.partner1Id === personId ? u.partner2Id : u.partner1Id;
    const unionW = included.has(spouseId) ? coupleSpan : card;
    const kids = sortByBirthOldestFirst(
      u.childships
        .map((c) => peopleById.get(c.childId))
        .filter((p): p is MarriageLayoutPerson => !!p && included.has(p.id)),
    );
    let blockW = unionW;
    if (kids.length > 0) {
      blockW = Math.max(blockW, fanWidth(kids.length, H, card));
      if (generationsBelowChild > 1) {
        for (const kid of kids) {
          blockW = Math.max(
            blockW,
            measureFocalChildColumnWidth(
              kid.id,
              unions,
              included,
              peopleById,
              generationsBelowChild - 1,
            ),
          );
        }
      }
    }
    maxW = Math.max(maxW, blockW);
  }

  return maxW;
}

function fanWidth(count: number, step: number, card: number): number {
  if (count <= 0) return card;
  return (count - 1) * step + card;
}

function unionsForPerson(
  personId: string,
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): MarriageLayoutUnion[] {
  return unions.filter((u) => {
    if (u.partner1Id !== personId && u.partner2Id !== personId) return false;
    const spouseId = u.partner1Id === personId ? u.partner2Id : u.partner1Id;
    if (included.has(spouseId)) return true;
    return u.childships.some((c) => included.has(c.childId));
  });
}

function pushSpouseEdge(
  edges: MarriageLayoutEdge[],
  unionId: string,
  husbandId: string,
  wifeId: string,
  prefix: string,
): void {
  if (edges.some((e) => e.type === "spouse" && e.label === unionId)) return;
  edges.push({
    id: `${prefix}-spouse-${unionId}`,
    source: husbandId,
    target: wifeId,
    type: "spouse",
    label: unionId,
  });
}

function pushChildEdge(
  edges: MarriageLayoutEdge[],
  sourceId: string,
  childId: string,
  unionId: string,
  prefix: string,
): void {
  const edgeId = `${prefix}-child-${sourceId}-${childId}-${unionId}`;
  if (edges.some((e) => e.id === edgeId)) return;
  edges.push({
    id: edgeId,
    source: sourceId,
    target: childId,
    type: "child",
    label: unionId,
  });
}

function layoutColumnUnderCenter(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  included: ReadonlySet<string>,
  unions: readonly MarriageLayoutUnion[],
  peopleById: Map<string, MarriageLayoutPerson>,
  personId: string,
  columnCenterX: number,
  childRowY: number,
  generationsBelowChild: number,
): void {
  const H = PEDIGREE_COLUMN_STEP;
  const V = PEDIGREE_ROW_STEP;
  const coupleStep = PEDIGREE_COUPLE_OFFSET;
  const descendantRowY = childRowY + V;

  positions.set(personId, {
    x: columnCenterX - PEDIGREE_CARD_SMALL_W / 2,
    y: childRowY,
  });

  const personUnions = unionsForPerson(personId, unions, included);

  if (personUnions.length === 0) {
    if (generationsBelowChild <= 0) return;
    const kids = sortByBirthOldestFirst(
      childrenOfPerson(personId, unions, included)
        .map((id) => peopleById.get(id))
        .filter((p): p is MarriageLayoutPerson => !!p),
    );
    const childIds = placeChildFan(
      positions,
      edges,
      kids,
      columnCenterX,
      descendantRowY,
      personId,
      "focal-col",
      H,
      undefined,
    );
    if (generationsBelowChild > 1 && childIds.length > 0) {
      placeDescendantSubtrees(
        positions,
        edges,
        included,
        unions,
        peopleById,
        childIds,
        generationsBelowChild - 1,
      );
    }
    return;
  }

  for (const u of personUnions) {
    const spouseId =
      u.partner1Id === personId ? u.partner2Id : u.partner1Id;
    if (!included.has(spouseId)) continue;

    const partners = resolveMarriagePartners(personId, spouseId, peopleById);
    const husbandX = husbandXForCoupleMid(columnCenterX);
    const wifeX = husbandX + coupleStep;
    positions.set(partners.husbandId, { x: husbandX, y: childRowY });
    positions.set(partners.wifeId, { x: wifeX, y: childRowY });
    pushSpouseEdge(edges, u.id, partners.husbandId, partners.wifeId, "focal-col");

    const coupleMidCenter = coupleMidFromHusbandX(husbandX);

    const children = sortByBirthOldestFirst(
      u.childships
        .map((c) => peopleById.get(c.childId))
        .filter((p): p is MarriageLayoutPerson => !!p && included.has(p.id)),
    );

    if (generationsBelowChild <= 0) continue;

    const parentSource =
      personId === partners.husbandId
        ? partners.husbandId
        : personId === partners.wifeId
          ? partners.wifeId
          : partners.husbandId;

    const grandchildIds = placeChildFan(
      positions,
      edges,
      children,
      coupleMidCenter,
      descendantRowY,
      parentSource,
      "focal-col",
      H,
      u.id,
    );

    if (generationsBelowChild > 1 && grandchildIds.length > 0) {
      placeDescendantSubtrees(
        positions,
        edges,
        included,
        unions,
        peopleById,
        grandchildIds,
        generationsBelowChild - 1,
      );
    }
  }
}

function placeChildFan(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  children: MarriageLayoutPerson[],
  centerX: number,
  rowY: number,
  parentSource: string,
  edgePrefix: string,
  H: number,
  unionId: string | undefined,
): string[] {
  const childIds: string[] = [];
  children.forEach((child, index) => {
    const x =
      centerX -
      PEDIGREE_CARD_SMALL_W / 2 +
      (index - (children.length - 1) / 2) * H;
    positions.set(child.id, { x, y: rowY });
    childIds.push(child.id);
    if (unionId) {
      pushChildEdge(edges, parentSource, child.id, unionId, edgePrefix);
    }
  });
  return childIds;
}

/**
 * Spread each focal union child into its own column; place spouse on the child row
 * and descendants below (mirrors sibling marriage subtrees for the child rail).
 */
export function placeFocalChildFamilyColumns(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  included: ReadonlySet<string>,
  unions: readonly MarriageLayoutUnion[],
  peopleById: Map<string, MarriageLayoutPerson>,
  marriageRowY: number,
  focalChildIds: readonly string[],
  coupleMidCenter: number,
  maxDescendantGenerations: number,
): void {
  if (focalChildIds.length === 0 || maxDescendantGenerations <= 1) return;

  const generationsBelowChild = maxDescendantGenerations - 1;
  const childRowY = marriageRowY + PEDIGREE_ROW_STEP;
  const gap = PEDIGREE_MIN_L_JOG;

  const sortedChildren = sortByBirthOldestFirst(
    focalChildIds
      .map((id) => peopleById.get(id))
      .filter((p): p is MarriageLayoutPerson => !!p),
  );

  const widths = sortedChildren.map((p) =>
    measureFocalChildColumnWidth(
      p.id,
      unions,
      included,
      peopleById,
      generationsBelowChild,
    ),
  );

  const total =
    widths.reduce((sum, w) => sum + w, 0) +
    Math.max(0, sortedChildren.length - 1) * gap;

  let cursor = coupleMidCenter - total / 2;

  for (let i = 0; i < sortedChildren.length; i++) {
    const person = sortedChildren[i];
    const columnCenter = cursor + widths[i] / 2;
    cursor += widths[i] + gap;

    layoutColumnUnderCenter(
      positions,
      edges,
      included,
      unions,
      peopleById,
      person.id,
      columnCenter,
      childRowY,
      generationsBelowChild,
    );
  }
}
