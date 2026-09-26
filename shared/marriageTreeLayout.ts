/**
 * Union-centric pedigree layout shared by web and mobile tree views.
 */

import {
  PEDIGREE_CARD_W,
  PEDIGREE_COUPLE_OFFSET,
  PEDIGREE_COLUMN_STEP,
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
  type: "spouse" | "parent" | "child";
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

/** Oldest first (left), unknown birth dates last. */
export function sortByBirthOldestFirst<T extends MarriageLayoutPerson>(
  people: T[],
): T[] {
  return [...people].sort((a, b) => birthTime(a) - birthTime(b));
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
    const ring = new Set<string>();
    for (const id of siblingsOf(focalId)) ring.add(id);
    for (const u of focalUnions) {
      const spouseId =
        u.partner1Id === focalId ? u.partner2Id : u.partner1Id;
      for (const id of siblingsOf(spouseId)) ring.add(id);
    }
    for (const id of ring) included.add(id);
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
 * parents above row center; ego siblings left, spouse siblings right.
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

  ensurePosition(positions, focalId, originX, originY);

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

  spouseEntries.forEach((entry, index) => {
    const spouseX = originX + (index + 1) * coupleStep;
    ensurePosition(positions, entry.spouseId, spouseX, originY);
    edges.push({
      id: `spouse-${focalId}-${entry.spouseId}`,
      source: focalId,
      target: entry.spouseId,
      type: "spouse",
      label: entry.union.id,
    });
  });

  const egoSiblings = sortByBirthOldestFirst(
    siblingsOf(focalId, unions)
      .filter((id) => included.has(id))
      .map((id) => peopleById.get(id))
      .filter((p): p is MarriageLayoutPerson => !!p),
  );
  egoSiblings.forEach((sib, index) => {
    const x = originX - (index + 1) * H;
    ensurePosition(positions, sib.id, x, originY);
  });

  let rightMost = originX + spouseEntries.length * coupleStep;
  for (const entry of spouseEntries) {
    const spouseSiblings = sortByBirthOldestFirst(
      siblingsOf(entry.spouseId, unions)
        .filter((id) => included.has(id))
        .map((id) => peopleById.get(id))
        .filter((p): p is MarriageLayoutPerson => !!p),
    );
    spouseSiblings.forEach((sib, index) => {
      const base = positions.get(entry.spouseId)?.x ?? originX;
      const x = base + (index + 1) * H;
      rightMost = Math.max(rightMost, x);
      ensurePosition(positions, sib.id, x, originY);
    });
  }

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
        x = anchorX - (parents.length - index) * H;
      } else if (side === "right") {
        x = anchorX + (index + 1) * H;
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

  const focalPerson = peopleById.get(focalId);
  const primarySpouse = spouseEntries[0];
  if (primarySpouse) {
    const spouseId = primarySpouse.spouseId;
    const spousePerson = peopleById.get(spouseId);
    const focalX = positions.get(focalId)?.x ?? originX;
    const spouseX = positions.get(spouseId)?.x ?? originX;
    const focalIsMale = focalPerson?.gender === "MALE";
    const spouseIsMale = spousePerson?.gender === "MALE";
    const husbandId =
      focalIsMale && !spouseIsMale
        ? focalId
        : spouseIsMale && !focalIsMale
          ? spouseId
          : focalX <= spouseX
            ? focalId
            : spouseId;
    const wifeId = husbandId === focalId ? spouseId : focalId;
    const husbandX = positions.get(husbandId)?.x ?? focalX;
    const wifeX = positions.get(wifeId)?.x ?? spouseX;
    placeParentsAbove(husbandId, husbandX, "left");
    if (!options?.phoneSingleParentSide) {
      placeParentsAbove(wifeId, wifeX, "right");
    }
  } else {
    placeParentsAbove(focalId, originX, "center");
  }

  spouseEntries.forEach((entry, unionIndex) => {
    const spouseX = positions.get(entry.spouseId)?.x ?? originX;
    const egoX = positions.get(focalId)?.x ?? originX;
    const coupleMidCenter = (egoX + spouseX + PEDIGREE_CARD_W) / 2;
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
        PEDIGREE_CARD_W / 2 +
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
    ensurePosition(positions, personId, rightMost + H, originY + V);
  }

  return {
    positions,
    focalPersonId: focalId,
    focalPartnerIds: spouseEntries.map((e) => e.spouseId),
    focalUnionId: spouseEntries[0]?.union.id ?? null,
    focalUnionIds: spouseEntries.map((e) => e.union.id),
    edges,
  };
}
