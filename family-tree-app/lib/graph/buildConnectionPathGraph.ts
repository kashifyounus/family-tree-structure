import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson } from "@/lib/kinship/types";
import {
  layoutKinshipPathTimeline,
  type PathLayoutStep,
} from "../../../shared/genealogy/pathTimelineLayout";
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
    nickname: p.nickname ?? null,
    gender: p.gender,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    currentCity: p.currentCity,
    isLiving: !p.deathDate,
  };
}

export function buildConnectionPathGraph(
  focalPersonId: string,
  endPersonId: string,
  steps: PathLayoutStep[],
): FamilyGraph | null {
  const { peopleById } = loadKinshipDataset();
  const startId = steps[0]?.fromId ?? focalPersonId;
  const personIds = new Set<string>([startId, endPersonId]);
  for (const s of steps) {
    personIds.add(s.fromId);
    personIds.add(s.toId);
  }

  const { positions, edges: pathEdges } = layoutKinshipPathTimeline(
    startId,
    steps,
    focalPersonId,
    endPersonId,
  );

  const nodes: FamilyGraphNode[] = [];
  for (const personId of personIds) {
    const p = peopleById.get(personId);
    const pos = positions.get(personId);
    if (!p || !pos) continue;
    nodes.push({
      id: personId,
      type: "person",
      position: { x: pos.x, y: pos.y },
      data: {
        person: toGraphPerson(p),
        isFocal: personId === focalPersonId,
        isDeceased: !!p.deathDate,
        hasUnexpandedParents: false,
        hasUnexpandedChildren: false,
        hasUnexpandedSiblings: false,
      },
    });
  }

  const edges: FamilyGraphEdge[] = pathEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
  }));

  return {
    focalPersonId,
    nodes,
    edges,
    focalPartnerIds: [],
  };
}
