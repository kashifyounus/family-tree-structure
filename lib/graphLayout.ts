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
import {
  collectIncludedPersonIds as collectIncludedPersonIdsShared,
  layoutMarriageCentricGraph,
  type MarriageLayoutUnion,
} from "@/shared/marriageTreeLayout";

export const collectIncludedPersonIds = collectIncludedPersonIdsShared;

function personNode(
  person: PersonSummary,
  x: number,
  y: number,
  isFocal: boolean,
  hints?: {
    hasUnexpandedParents?: boolean;
    hasUnexpandedChildren?: boolean;
    hasUnexpandedSiblings?: boolean;
  },
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
      hasUnexpandedSiblings: hints?.hasUnexpandedSiblings,
    },
  };
}

function toLayoutUnions(unions: UnionRecord[]): MarriageLayoutUnion[] {
  return unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    childships: u.childships.map((c) => ({ childId: c.childId })),
  }));
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
  const layoutPeople = new Map(
    [...included]
      .map((id) => peopleById.get(id))
      .filter((p): p is Person => !!p)
      .map((p) => [p.id, { id: p.id, birthDate: p.birthDate }]),
  );

  const { positions, edges: layoutEdges, focalPartnerIds } =
    layoutMarriageCentricGraph(
      focal.id,
      layoutPeople,
      toLayoutUnions(unions),
      included,
      originX,
      originY,
    );

  const hintsFor = (personId: string) =>
    getExplorationHints(personId, included, unions);

  const nodes: FamilyGraphNode[] = [];
  for (const personId of included) {
    const pos = positions.get(personId);
    const p = peopleById.get(personId);
    if (!pos || !p) continue;
    const isEgo = personId === focal.id;
    const isPartner = focalPartnerIds.includes(personId);
    nodes.push(
      personNode(
        toPersonSummary(p),
        pos.x,
        pos.y,
        isFocal && (isEgo || isPartner),
        hintsFor(personId),
      ),
    );
  }

  const edges: FamilyGraphEdge[] = layoutEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    label: e.label,
  }));

  return { nodes, edges };
}

export function buildFamilyGraph(
  focal: Person,
  allPeople: Person[],
  unions: UnionRecord[],
  generationsUp = 2,
  generationsDown = 2,
  siblingSteps = 0,
): FamilyGraph {
  const included = collectIncludedPersonIds(
    focal.id,
    unions,
    generationsUp,
    generationsDown,
    siblingSteps,
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
