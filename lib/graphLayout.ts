import type {
  FamilyGraph,
  FamilyGraphEdge,
  FamilyGraphNode,
  PersonSummary,
} from "@/types/family";
import type { UnionRecord } from "@/lib/kinship";
import { getExplorationHints } from "@/lib/graphExplore";
import { toPersonSummary } from "@/lib/personMapper";
import type { Person } from "@prisma/client";

const H_SPACING = 220;
const V_SPACING = 160;

function personNode(
  person: PersonSummary,
  x: number,
  y: number,
  isFocal: boolean,
  hints?: { hasUnexpandedParents?: boolean; hasUnexpandedChildren?: boolean },
): FamilyGraphNode {
  return {
    id: person.id,
    type: "person",
    position: { x, y },
    data: {
      person,
      isFocal,
      isDeceased: !!person.deathDate || !person.isLiving,
      hasUnexpandedParents: hints?.hasUnexpandedParents,
      hasUnexpandedChildren: hints?.hasUnexpandedChildren,
    },
  };
}

export function collectIncludedPersonIds(
  focalId: string,
  unions: UnionRecord[],
  generationsUp: number,
  generationsDown: number,
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

  collectAncestors(focalId, 0, new Set());
  collectDescendants(focalId, 0, new Set());

  const focalUnions = unions.filter(
    (u) => u.partner1Id === focalId || u.partner2Id === focalId,
  );
  for (const u of focalUnions) {
    included.add(u.partner1Id);
    included.add(u.partner2Id);
  }

  return included;
}

function layoutFocalCentric(
  focal: Person,
  peopleById: Map<string, Person>,
  unions: UnionRecord[],
  included: Set<string>,
  isFocal: boolean,
  originX = 0,
  originY = 0,
): { nodes: FamilyGraphNode[]; edges: FamilyGraphEdge[] } {
  const nodes: FamilyGraphNode[] = [];
  const edges: FamilyGraphEdge[] = [];
  const focalSummary = toPersonSummary(focal);

  const hintsFor = (personId: string) =>
    getExplorationHints(personId, included, unions);

  nodes.push(
    personNode(
      focalSummary,
      originX,
      originY,
      isFocal,
      hintsFor(focal.id),
    ),
  );

  const focalUnions = unions.filter(
    (u) => u.partner1Id === focal.id || u.partner2Id === focal.id,
  );

  const spouses = focalUnions
    .map((u) =>
      u.partner1Id === focal.id
        ? peopleById.get(u.partner2Id)
        : peopleById.get(u.partner1Id),
    )
    .filter((p): p is Person => !!p && included.has(p.id));

  spouses.forEach((spouse, index) => {
    const offset = (index + 1) * H_SPACING * (index % 2 === 0 ? 1 : -1);
    nodes.push(
      personNode(
        toPersonSummary(spouse),
        originX + offset,
        originY,
        false,
        hintsFor(spouse.id),
      ),
    );
    edges.push({
      id: `spouse-${focal.id}-${spouse.id}`,
      source: focal.id,
      target: spouse.id,
      type: "spouse",
      label: "union",
    });
  });

  const parentUnions = unions.filter((u) =>
    u.childships.some((c) => c.childId === focal.id),
  );
  const parentIds = new Set<string>();
  parentUnions.forEach((u) => {
    parentIds.add(u.partner1Id);
    parentIds.add(u.partner2Id);
  });
  const parents = [...parentIds]
    .map((id) => peopleById.get(id))
    .filter((p): p is Person => !!p);

  parents.forEach((parent, index) => {
    const x = originX + (index - (parents.length - 1) / 2) * H_SPACING;
    if (!nodes.find((n) => n.id === parent.id)) {
      nodes.push(
        personNode(
          toPersonSummary(parent),
          x,
          originY - V_SPACING,
          false,
          hintsFor(parent.id),
        ),
      );
    }
    edges.push({
      id: `parent-${parent.id}-${focal.id}`,
      source: parent.id,
      target: focal.id,
      type: "parent",
    });
  });

  const childrenByUnion = focalUnions.map((u) => ({
    union: u,
    children: u.childships
      .map((c) => peopleById.get(c.childId))
      .filter((p): p is Person => !!p && included.has(p.id)),
  }));

  let childRow = 0;
  for (const group of childrenByUnion) {
    group.children.forEach((child, index) => {
      const x =
        originX +
        (index - (group.children.length - 1) / 2) * H_SPACING +
        childRow * 40;
      if (!nodes.find((n) => n.id === child.id)) {
        nodes.push(
          personNode(
            toPersonSummary(child),
            x,
            originY + V_SPACING,
            false,
            hintsFor(child.id),
          ),
        );
      }
      edges.push({
        id: `child-${focal.id}-${child.id}-${group.union.id}`,
        source: focal.id,
        target: child.id,
        type: "child",
        label: group.union.id,
      });
    });
    childRow += 1;
  }

  for (const personId of included) {
    if (personId === focal.id) continue;
    if (nodes.find((n) => n.id === personId)) continue;
    const p = peopleById.get(personId);
    if (!p) continue;
    nodes.push(
      personNode(
        toPersonSummary(p),
        originX + H_SPACING * 2,
        originY + V_SPACING,
        false,
        hintsFor(p.id),
      ),
    );
  }

  return { nodes, edges };
}

export function buildFamilyGraph(
  focal: Person,
  allPeople: Person[],
  unions: UnionRecord[],
  generationsUp = 2,
  generationsDown = 2,
): FamilyGraph {
  const included = collectIncludedPersonIds(
    focal.id,
    unions,
    generationsUp,
    generationsDown,
  );
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));
  const { nodes, edges } = layoutFocalCentric(
    focal,
    peopleById,
    unions,
    included,
    true,
  );

  return {
    focalPersonId: focal.id,
    nodes,
    edges,
  };
}

export function buildExpansionSubgraph(
  anchor: Person,
  people: Person[],
  unions: UnionRecord[],
  direction: "up" | "down" | "both",
  anchorPosition: { x: number; y: number },
): FamilyGraph {
  const gensUp = direction === "up" || direction === "both" ? 1 : 0;
  const gensDown = direction === "down" || direction === "both" ? 1 : 0;
  const included = collectIncludedPersonIds(
    anchor.id,
    unions,
    gensUp + 1,
    gensDown + 1,
  );
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const { nodes, edges } = layoutFocalCentric(
    anchor,
    peopleById,
    unions,
    included,
    false,
    anchorPosition.x,
    anchorPosition.y,
  );

  return {
    focalPersonId: anchor.id,
    nodes,
    edges,
  };
}
