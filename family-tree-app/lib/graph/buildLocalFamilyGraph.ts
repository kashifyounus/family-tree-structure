import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";
import type {
  FamilyGraph,
  FamilyGraphEdge,
  FamilyGraphNode,
  GraphPersonSummary,
} from "@/lib/graph/types";

const H_SPACING = 200;
const V_SPACING = 150;

function toGraphPerson(p: KinshipPerson): GraphPersonSummary {
  return {
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    currentCity: p.currentCity,
    isLiving: !p.deathDate,
  };
}

function personNode(
  person: GraphPersonSummary,
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
      isDeceased: !person.isLiving,
    },
  };
}

export function collectIncludedPersonIds(
  focalId: string,
  unions: KinshipUnionRecord[],
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
  focal: KinshipPerson,
  peopleById: Map<string, KinshipPerson>,
  unions: KinshipUnionRecord[],
  included: Set<string>,
  isFocal: boolean,
  originX = 0,
  originY = 0,
): { nodes: FamilyGraphNode[]; edges: FamilyGraphEdge[] } {
  const nodes: FamilyGraphNode[] = [];
  const edges: FamilyGraphEdge[] = [];

  nodes.push(
    personNode(toGraphPerson(focal), originX, originY, isFocal),
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
    .filter((p): p is KinshipPerson => !!p && included.has(p.id));

  spouses.forEach((spouse, index) => {
    const offset = (index + 1) * H_SPACING * (index % 2 === 0 ? 1 : -1);
    nodes.push(
      personNode(toGraphPerson(spouse), originX + offset, originY, false),
    );
    edges.push({
      id: `spouse-${focal.id}-${spouse.id}`,
      source: focal.id,
      target: spouse.id,
      type: "spouse",
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
    .filter((p): p is KinshipPerson => !!p);

  parents.forEach((parent, index) => {
    const x = originX + (index - (parents.length - 1) / 2) * H_SPACING;
    if (!nodes.find((n) => n.id === parent.id)) {
      nodes.push(personNode(toGraphPerson(parent), x, originY - V_SPACING, false));
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
      .filter((p): p is KinshipPerson => !!p && included.has(p.id)),
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
          personNode(toGraphPerson(child), x, originY + V_SPACING, false),
        );
      }
      edges.push({
        id: `child-${focal.id}-${child.id}-${group.union.id}`,
        source: focal.id,
        target: child.id,
        type: "child",
      });
    });
    childRow += 1;
  }

  return { nodes, edges };
}

export function buildLocalFamilyGraph(
  familyCode: string,
  generationsUp = 2,
  generationsDown = 2,
): FamilyGraph | null {
  const member = getLocalMemberByFamilyCode(familyCode);
  if (!member) return null;

  const { peopleById, allUnions } = loadKinshipDataset();
  const focal = peopleById.get(member.id);
  if (!focal) return null;

  const included = collectIncludedPersonIds(
    focal.id,
    allUnions,
    generationsUp,
    generationsDown,
  );
  const { nodes, edges } = layoutFocalCentric(
    focal,
    peopleById,
    allUnions,
    included,
    true,
  );

  return {
    focalPersonId: focal.id,
    nodes,
    edges,
  };
}
