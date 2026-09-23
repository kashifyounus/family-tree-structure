import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";
import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
  type MarriageLayoutUnion,
} from "../../../shared/marriageTreeLayout";
import { getExplorationHints } from "@/lib/graph/explorationHints";
import type {
  FamilyGraph,
  FamilyGraphEdge,
  FamilyGraphNode,
  GraphPersonSummary,
} from "@/lib/graph/types";

function toGraphPerson(p: KinshipPerson): GraphPersonSummary {
  return {
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    urduFirstName: p.urduFirstName ?? null,
    urduLastName: p.urduLastName ?? null,
    gender: p.gender,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    currentCity: p.currentCity,
    isLiving: !p.deathDate,
  };
}

function toLayoutUnions(unions: KinshipUnionRecord[]): MarriageLayoutUnion[] {
  return unions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    childships: u.childships.map((c) => ({ childId: c.childId })),
  }));
}

export type BuildLocalGraphOptions = {
  generationsUp?: number;
  generationsDown?: number;
  siblingSteps?: number;
};

export function buildLocalFamilyGraph(
  familyCode: string,
  options: BuildLocalGraphOptions = {},
): FamilyGraph | null {
  const generationsUp = options.generationsUp ?? 2;
  const generationsDown = options.generationsDown ?? 2;
  const siblingSteps = options.siblingSteps ?? 0;

  const member = getLocalMemberByFamilyCode(familyCode);
  if (!member) return null;

  const { peopleById, allUnions } = loadKinshipDataset();
  const focal = peopleById.get(member.id);
  if (!focal) return null;

  const included = collectIncludedPersonIds(
    focal.id,
    toLayoutUnions(allUnions),
    generationsUp,
    generationsDown,
    siblingSteps,
  );

  const layoutPeople = new Map(
    [...included]
      .map((id) => peopleById.get(id))
      .filter((p): p is KinshipPerson => !!p)
      .map((p) => [p.id, { id: p.id, birthDate: p.birthDate }]),
  );

  const { positions, edges: layoutEdges, focalPartnerIds } =
    layoutMarriageCentricGraph(
      focal.id,
      layoutPeople,
      toLayoutUnions(allUnions),
      included,
    );

  const nodes: FamilyGraphNode[] = [];
  for (const personId of included) {
    const pos = positions.get(personId);
    const p = peopleById.get(personId);
    if (!pos || !p) continue;
    const hints = getExplorationHints(personId, included, allUnions);
    const isEgo = personId === focal.id;
    const isPartner = focalPartnerIds.includes(personId);
    nodes.push({
      id: personId,
      type: "person",
      position: { x: pos.x, y: pos.y },
      data: {
        person: toGraphPerson(p),
        isFocal: isEgo || isPartner,
        isDeceased: !!p.deathDate,
        hasUnexpandedParents: hints.hasUnexpandedParents,
        hasUnexpandedChildren: hints.hasUnexpandedChildren,
        hasUnexpandedSiblings: hints.hasUnexpandedSiblings,
      },
    });
  }

  const edges: FamilyGraphEdge[] = layoutEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
  }));

  return {
    focalPersonId: focal.id,
    nodes,
    edges,
  };
}
