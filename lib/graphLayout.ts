import type {
  FamilyGraph,
  FamilyGraphEdge,
  FamilyGraphNode,
  PersonSummary,
} from "@/types/family";
import type { UnionRecord } from "@/lib/kinship";
import { toPersonSummary } from "@/lib/personMapper";
import type { Person } from "@prisma/client";

const H_SPACING = 220;
const V_SPACING = 160;

function personNode(
  person: PersonSummary,
  x: number,
  y: number,
  isFocal: boolean,
): FamilyGraphNode {
  return {
    id: person.id,
    type: "person",
    position: { x, y },
    data: {
      person,
      isFocal,
      isDeceased: !person.isLiving || !!person.deathDate,
    },
  };
}

function collectAncestors(
  personId: string,
  unions: UnionRecord[],
  depth: number,
  maxDepth: number,
  visited: Set<string>,
  acc: Set<string>,
): void {
  if (depth >= maxDepth || visited.has(personId)) return;
  visited.add(personId);

  const parentUnions = unions.filter((u) =>
    u.childships.some((c) => c.childId === personId),
  );
  for (const u of parentUnions) {
    acc.add(u.partner1Id);
    acc.add(u.partner2Id);
    collectAncestors(u.partner1Id, unions, depth + 1, maxDepth, visited, acc);
    collectAncestors(u.partner2Id, unions, depth + 1, maxDepth, visited, acc);
  }
}

function collectDescendants(
  personId: string,
  unions: UnionRecord[],
  depth: number,
  maxDepth: number,
  visited: Set<string>,
  acc: Set<string>,
): void {
  if (depth >= maxDepth || visited.has(`d-${personId}`)) return;
  visited.add(`d-${personId}`);

  const spouseUnions = unions.filter(
    (u) => u.partner1Id === personId || u.partner2Id === personId,
  );
  for (const u of spouseUnions) {
    for (const cs of u.childships) {
      acc.add(cs.childId);
      collectDescendants(cs.childId, unions, depth + 1, maxDepth, visited, acc);
    }
  }
}

export function buildFamilyGraph(
  focal: Person,
  allPeople: Person[],
  unions: UnionRecord[],
  generationsUp = 2,
  generationsDown = 2,
): FamilyGraph {
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));
  const included = new Set<string>([focal.id]);

  collectAncestors(focal.id, unions, 0, generationsUp, new Set(), included);
  collectDescendants(
    focal.id,
    unions,
    0,
    generationsDown,
    new Set(),
    included,
  );

  const focalUnions = unions.filter(
    (u) => u.partner1Id === focal.id || u.partner2Id === focal.id,
  );
  for (const u of focalUnions) {
    included.add(u.partner1Id);
    included.add(u.partner2Id);
  }

  const nodes: FamilyGraphNode[] = [];
  const edges: FamilyGraphEdge[] = [];

  const focalSummary = toPersonSummary(focal);
  nodes.push(personNode(focalSummary, 0, 0, true));

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
      personNode(toPersonSummary(spouse), offset, 0, false),
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
    const x = (index - (parents.length - 1) / 2) * H_SPACING;
    if (!nodes.find((n) => n.id === parent.id)) {
      nodes.push(personNode(toPersonSummary(parent), x, -V_SPACING, false));
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
        (index - (group.children.length - 1) / 2) * H_SPACING +
        childRow * 40;
      if (!nodes.find((n) => n.id === child.id)) {
        nodes.push(
          personNode(toPersonSummary(child), x, V_SPACING, false),
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
    nodes.push(personNode(toPersonSummary(p), H_SPACING * 2, V_SPACING, false));
  }

  return {
    focalPersonId: focal.id,
    nodes,
    edges,
  };
}
