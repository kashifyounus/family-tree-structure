/**
 * Union-centric pedigree layout shared by web and mobile tree views.
 */

import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_COUPLE_OFFSET,
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_PARENT_MID_GAP,
  PEDIGREE_PARENT_OUTER_MARGIN,
  PEDIGREE_ROW_STEP,
} from "./pedigreeLayoutTokens";

export type MarriageLayoutChildship = {
  childId: string;
};

export type MarriageLayoutUnion = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  childships: MarriageLayoutChildship[];
};

export type MarriageLayoutPerson = {
  id: string;
  birthDate?: string | Date | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string | null;
};

export type MarriageLayoutEdge = {
  id: string;
  source: string;
  target: string;
  type: "spouse" | "parent" | "child" | "sibling";
  label?: string;
};

export type MarriageLayoutOptions = {
  /** When set, this union is treated as the primary marriage row (first spouse column). */
  preferredFocalUnionId?: string | null;
  /**
   * Phone default: only one parent branch above the focal couple (husband line left).
   * Wife-side parents stay off-tree until the user loads more generations.
   */
  phoneSingleParentSide?: boolean;
  /** When true (default), only the primary union appears on the marriage row (B1). */
  onlyPrimarySpouseOnRow?: boolean;
};

export type MarriageLayoutResult = {
  positions: Map<string, { x: number; y: number }>;
  focalPersonId: string;
  focalPartnerIds: string[];
  /** Primary union on the marriage row (first spouse union after sorting). */
  focalUnionId: string | null;
  focalUnionIds: string[];
  edges: MarriageLayoutEdge[];
};

/** @deprecated Use pedigreeLayoutTokens — kept for tests referencing spacing scale. */
export const MARRIAGE_H_SPACING = PEDIGREE_COLUMN_STEP;
export const MARRIAGE_V_SPACING = PEDIGREE_ROW_STEP;

function birthTime(p: MarriageLayoutPerson): number {
  if (!p.birthDate) return Number.POSITIVE_INFINITY;
  const d =
    p.birthDate instanceof Date ? p.birthDate : new Date(String(p.birthDate));
  const t = d.getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/** Oldest first (left), unknown birth dates last; tie-break by id. */
export function sortByBirthOldestFirst<T extends MarriageLayoutPerson>(
  people: T[],
): T[] {
  return [...people].sort((a, b) => {
    const byBirth = birthTime(a) - birthTime(b);
    if (byBirth !== 0) return byBirth;
    return a.id.localeCompare(b.id);
  });
}

export function resolveMarriagePartners(
  partnerAId: string,
  partnerBId: string,
  peopleById: Map<string, MarriageLayoutPerson>,
): { husbandId: string; wifeId: string } {
  const a = peopleById.get(partnerAId);
  const b = peopleById.get(partnerBId);
  const aMale = a?.gender === "MALE";
  const bMale = b?.gender === "MALE";
  const aFemale = a?.gender === "FEMALE";
  const bFemale = b?.gender === "FEMALE";
  if (aMale && !bMale) return { husbandId: partnerAId, wifeId: partnerBId };
  if (bMale && !aMale) return { husbandId: partnerBId, wifeId: partnerAId };
  if (aFemale && !bFemale) return { husbandId: partnerBId, wifeId: partnerAId };
  if (bFemale && !aFemale) return { husbandId: partnerAId, wifeId: partnerBId };
  return { husbandId: partnerAId, wifeId: partnerBId };
}

function placeSiblingWing(
  positions: Map<string, { x: number; y: number }>,
  edges: MarriageLayoutEdge[],
  anchorPersonId: string,
  wing: "left" | "right",
  siblingIds: string[],
  columnStep: number,
  rowY: number,
  cardWidth: number,
): number {
  if (siblingIds.length === 0) {
    return positions.get(anchorPersonId)?.x ?? 0;
  }
  const anchorX = positions.get(anchorPersonId)?.x ?? 0;
  const placed: string[] = [];
  siblingIds.forEach((sibId, index) => {
    let x: number;
    if (wing === "left") {
      x = anchorX - (siblingIds.length - index) * columnStep;
    } else {
      x = anchorX + cardWidth + (index + 1) * columnStep;
    }
    ensurePosition(positions, sibId, x, rowY);
    placed.push(sibId);
  });

  if (wing === "left") {
    for (let i = 0; i < placed.length - 1; i++) {
      edges.push({
        id: `sibling-wing-${placed[i]}-${placed[i + 1]}`,
        source: placed[i],
        target: placed[i + 1],
        type: "sibling",
      });
    }
    edges.push({
      id: `sibling-wing-${placed[placed.length - 1]}-${anchorPersonId}`,
      source: placed[placed.length - 1],
      target: anchorPersonId,
      type: "sibling",
    });
    return placed[0] ? (positions.get(placed[0])?.x ?? anchorX) : anchorX;
  }

  edges.push({
    id: `sibling-wing-${anchorPersonId}-${placed[0]}`,
    source: anchorPersonId,
    target: placed[0],
    type: "sibling",
  });
  for (let i = 0; i < placed.length - 1; i++) {
    edges.push({
      id: `sibling-wing-${placed[i]}-${placed[i + 1]}`,
      source: placed[i],
      target: placed[i + 1],
      type: "sibling",
    });
  }
  const last = placed[placed.length - 1];
  return positions.get(last)?.x ?? anchorX;
}

export function collectIncludedPersonIds(
  focalId: string,
  unions: MarriageLayoutUnion[],
  generationsUp: number,
  generationsDown: number,
  siblingSteps = 0,
): Set<string> {
  const included = new Set<string>([focalId]);

  function collectAncestors(
    personId: string,
    depth: number,
    visited: Set<string>,
  ): void {
    if (depth >= generationsUp || visited.has(`a-${personId}`)) return;
    visited.add(`a-${personId}`);
    const parentUnions = unions.filter((u) =>
      u.childships.some((c) => c.childId === personId),
    );
    for (const u of parentUnions) {
      included.add(u.partner1Id);
      included.add(u.partner2Id);
      collectAncestors(u.partner1Id, depth + 1, visited);
      collectAncestors(u.partner2Id, depth + 1, visited);
    }
  }

  function collectDescendants(
    personId: string,
    depth: number,
    visited: Set<string>,
  ): void {
    if (depth >= generationsDown || visited.has(`d-${personId}`)) return;
    visited.add(`d-${personId}`);
    const spouseUnions = unions.filter(
      (u) => u.partner1Id === personId || u.partner2Id === personId,
    );
    for (const u of spouseUnions) {
      included.add(u.partner1Id);
      included.add(u.partner2Id);
      for (const cs of u.childships) {
        included.add(cs.childId);
        collectDescendants(cs.childId, depth + 1, visited);
      }
    }
  }

  function siblingsOf(personId: string): string[] {
    const parentUnions = unions.filter((u) =>
      u.childships.some((c) => c.childId === personId),
    );
    const sibs = new Set<string>();
    for (const u of parentUnions) {
      for (const cs of u.childships) {
        if (cs.childId !== personId) sibs.add(cs.childId);
      }
    }
    return [...sibs];
  }

  function collectSiblingRing(steps: number): void {
    if (steps <= 0) return;
    const focalUnions = unions.filter(
      (u) => u.partner1Id === focalId || u.partner2Id === focalId,
    );
    let seeds = new Set<string>([focalId]);
    for (const u of focalUnions) {
      const spouseId =
        u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
      seeds.add(spouseId);
    }
    for (let step = 0; step < steps; step++) {
      const nextSeeds = new Set<string>();
      for (const personId of seeds) {
        for (const sibId of siblingsOf(personId)) {
          included.add(sibId);
          nextSeeds.add(sibId);
        }
      }
      seeds = nextSeeds;
    }
  }

  collectAncestors(focalId, 0, new Set());
  collectDescendants(focalId, 0, new Set());

  const focalUnions = unions.filter(
    (u) => u.partner1Id === focalId || u.partner2Id === focalId,
  );
  for (const u of focalUnions) {
    included.add(u.partner1Id);
    included.add(u.partner2Id);
  }

  /** Spouse parent generation (in-laws above the marriage row) at the same depth as ego parents. */
  if (generationsUp >= 1) {
    for (const u of focalUnions) {
      const spouseId =
        u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
      const spouseParentUnions = unions.filter((pu) =>
        pu.childships.some((c) => c.childId === spouseId),
      );
      for (const pu of spouseParentUnions) {
        included.add(pu.partner1Id);
        included.add(pu.partner2Id);
      }
    }
  }

  collectSiblingRing(siblingSteps);

  return included;
}

function ensurePosition(
  positions: Map<string, { x: number; y: number }>,
  id: string,
  x: number,
  y: number,
): void {
  if (!positions.has(id)) {
    positions.set(id, { x, y });
  }
}

function siblingsOf(
  personId: string,
  unions: MarriageLayoutUnion[],
): string[] {
  const parentUnions = unions.filter((u) =>
    u.childships.some((c) => c.childId === personId),
  );
  const sibs = new Set<string>();
  for (const u of parentUnions) {
    for (const cs of u.childships) {
      if (cs.childId !== personId) sibs.add(cs.childId);
    }
  }
  return [...sibs];
}

/**
 * Marriage-row center: ego and all spouses on one row; child columns per union;
 * parents above wings; husband left / wife right; siblings on each partner's wing.
 */
export function layoutMarriageCentricGraph(
  focalId: string,
  peopleById: Map<string, MarriageLayoutPerson>,
  unions: MarriageLayoutUnion[],
  included: Set<string>,
  originX = 0,
  originY = 0,
  options?: MarriageLayoutOptions,
): MarriageLayoutResult {
  const positions = new Map<string, { x: number; y: number }>();
  const edges: MarriageLayoutEdge[] = [];
  const focal = peopleById.get(focalId);
  if (!focal) {
    return {
      positions,
      focalPersonId: focalId,
      focalPartnerIds: [],
      focalUnionId: null,
      focalUnionIds: [],
      edges,
    };
  }

  const H = PEDIGREE_COLUMN_STEP;
  const V = PEDIGREE_ROW_STEP;
  const coupleStep = PEDIGREE_COUPLE_OFFSET;

  const focalUnions = unions
    .filter((u) => u.partner1Id === focalId || u.partner2Id === focalId)
    .sort((a, b) => a.id.localeCompare(b.id));

  const spouseEntries: { union: MarriageLayoutUnion; spouseId: string }[] = [];
  for (const u of focalUnions) {
    const spouseId =
      u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
    if (!included.has(spouseId)) continue;
    spouseEntries.push({ union: u, spouseId });
  }

  const preferred = options?.preferredFocalUnionId;
  if (preferred) {
    const idx = spouseEntries.findIndex((e) => e.union.id === preferred);
    if (idx > 0) {
      const [picked] = spouseEntries.splice(idx, 1);
      spouseEntries.unshift(picked);
    }
  }

  const rowSpouseEntries =
    options?.onlyPrimarySpouseOnRow === false
      ? spouseEntries
      : spouseEntries.slice(0, 1);

  let husbandId = focalId;
  let wifeId: string | null = null;
  let rightMost = originX + coupleStep;

  const primaryEntry = rowSpouseEntries[0];
  if (primaryEntry) {
    const partners = resolveMarriagePartners(
      focalId,
      primaryEntry.spouseId,
      peopleById,
    );
    husbandId = partners.husbandId;
    wifeId = partners.wifeId;
    ensurePosition(positions, husbandId, originX, originY);
    ensurePosition(positions, wifeId, originX + coupleStep, originY);
    edges.push({
      id: `spouse-${husbandId}-${wifeId}`,
      source: husbandId,
      target: wifeId,
      type: "spouse",
      label: primaryEntry.union.id,
    });
    rightMost = originX + coupleStep;

    if (options?.onlyPrimarySpouseOnRow === false) {
      let extraX = originX + coupleStep;
      for (let i = 1; i < rowSpouseEntries.length; i++) {
        const entry = rowSpouseEntries[i];
        extraX += coupleStep;
        ensurePosition(positions, entry.spouseId, extraX, originY);
        rightMost = Math.max(rightMost, extraX);
        edges.push({
          id: `spouse-${focalId}-${entry.spouseId}`,
          source: focalId,
          target: entry.spouseId,
          type: "spouse",
          label: entry.union.id,
        });
      }
    }
  } else {
    ensurePosition(positions, focalId, originX, originY);
  }

  let leftMost = originX;
  const husbandSiblingIds = sortByBirthOldestFirst(
    siblingsOf(husbandId, unions)
      .filter((id) => included.has(id))
      .map((id) => peopleById.get(id))
      .filter((p): p is MarriageLayoutPerson => !!p),
  ).map((p) => p.id);
  leftMost = placeSiblingWing(
    positions,
    edges,
    husbandId,
    "left",
    husbandSiblingIds,
    H,
    originY,
    PEDIGREE_CARD_BIG_W,
  );

  if (wifeId) {
    const wifeSiblingIds = sortByBirthOldestFirst(
      siblingsOf(wifeId, unions)
        .filter((id) => included.has(id))
        .map((id) => peopleById.get(id))
        .filter((p): p is MarriageLayoutPerson => !!p),
    ).map((p) => p.id);
    const wifeRight = placeSiblingWing(
      positions,
      edges,
      wifeId,
      "right",
      wifeSiblingIds,
      H,
      originY,
      PEDIGREE_CARD_BIG_W,
    );
    rightMost = Math.max(rightMost, wifeRight);
  }
  rightMost = Math.max(rightMost, originX + coupleStep);

  function parentsForPerson(personId: string): MarriageLayoutPerson[] {
    const parentUnions = unions.filter((u) =>
      u.childships.some((c) => c.childId === personId),
    );
    const parentIds = new Set<string>();
    parentUnions.forEach((u) => {
      if (included.has(u.partner1Id)) parentIds.add(u.partner1Id);
      if (included.has(u.partner2Id)) parentIds.add(u.partner2Id);
    });
    return sortByBirthOldestFirst(
      [...parentIds]
        .map((id) => peopleById.get(id))
        .filter((p): p is MarriageLayoutPerson => !!p),
    );
  }

  function placeParentsAbove(
    personId: string,
    anchorX: number,
    side: "left" | "right" | "center",
  ): void {
    const parents = parentsForPerson(personId);
    parents.forEach((parent, index) => {
      let x = anchorX;
      if (side === "left") {
        x =
          anchorX -
          PEDIGREE_PARENT_OUTER_MARGIN -
          (parents.length - index) * PEDIGREE_COLUMN_STEP;
      } else if (side === "right") {
        x = anchorX + PEDIGREE_CARD_BIG_W + PEDIGREE_PARENT_MID_GAP + index * PEDIGREE_COLUMN_STEP;
      } else {
        x = anchorX + (index - (parents.length - 1) / 2) * H;
      }
      ensurePosition(positions, parent.id, x, originY - V);
      edges.push({
        id: `parent-${parent.id}-${personId}`,
        source: parent.id,
        target: personId,
        type: "parent",
      });
    });
  }

  if (wifeId) {
    const husbandX = positions.get(husbandId)?.x ?? originX;
    const wifeX = positions.get(wifeId)?.x ?? originX + coupleStep;
    placeParentsAbove(husbandId, husbandX, "left");
    if (!options?.phoneSingleParentSide) {
      placeParentsAbove(wifeId, wifeX, "right");
    }
  } else {
    placeParentsAbove(focalId, originX, "center");
  }

  rowSpouseEntries.forEach((entry, unionIndex) => {
    const focalX = positions.get(focalId)?.x ?? originX;
    const spouseX = positions.get(entry.spouseId)?.x ?? originX;
    const leftX = Math.min(focalX, spouseX);
    const rightX = Math.max(focalX, spouseX);
    const coupleMidCenter = (leftX + rightX + PEDIGREE_CARD_BIG_W) / 2;
    const children = sortByBirthOldestFirst(
      entry.union.childships
        .map((c) => peopleById.get(c.childId))
        .filter(
          (p): p is MarriageLayoutPerson =>
            !!p && included.has(p.id),
        ),
    );
    children.forEach((child, index) => {
      const x =
        coupleMidCenter -
        PEDIGREE_CARD_SMALL_W / 2 +
        (index - (children.length - 1) / 2) * H +
        unionIndex * 24;
      ensurePosition(positions, child.id, x, originY + V);
      edges.push({
        id: `child-${focalId}-${child.id}-${entry.union.id}`,
        source: focalId,
        target: child.id,
        type: "child",
        label: entry.union.id,
      });
    });
  });

  for (const personId of included) {
    if (positions.has(personId)) continue;
    const p = peopleById.get(personId);
    if (!p) continue;
    ensurePosition(
      positions,
      personId,
      Math.max(rightMost, leftMost) + H,
      originY + V,
    );
  }

  return {
    positions,
    focalPersonId: focalId,
    focalPartnerIds: rowSpouseEntries.map((e) => e.spouseId),
    focalUnionId: rowSpouseEntries[0]?.union.id ?? null,
    focalUnionIds: rowSpouseEntries.map((e) => e.union.id),
    edges,
  };
}
