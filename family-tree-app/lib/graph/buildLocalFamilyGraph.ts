import { formatDisplayDate } from "@/lib/format/displayDate";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";
import { generationsToIncludeKinshipPath } from "../../../shared/genealogy/kinshipPathFraming";
import { resolvePrimaryTreeUnionId } from "../../../shared/genealogy/resolvePrimaryTreeUnion";
import {
  DEFAULT_TREE_GENERATIONS_DOWN,
  DEFAULT_TREE_GENERATIONS_UP,
} from "../../../shared/genealogy/treeExpansion";
import { getPrimaryTreeUnionId } from "@/lib/settings/primaryTreeUnion";
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
    nickname: p.nickname ?? null,
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
  cousinDegree?: number;
  focalUnionId?: string | null;
  /** Always include these person ids (e.g. find-relation path). */
  ensurePersonIds?: string[];
};

export function buildLocalFamilyGraph(
  familyCode: string,
  options: BuildLocalGraphOptions = {},
): FamilyGraph | null {
  let generationsUp =
    options.generationsUp ?? DEFAULT_TREE_GENERATIONS_UP;
  let generationsDown =
    options.generationsDown ?? DEFAULT_TREE_GENERATIONS_DOWN;
  const siblingSteps = options.siblingSteps ?? 0;
  const cousinDegree = options.cousinDegree ?? 0;

  const member = getLocalMemberByFamilyCode(familyCode);
  if (!member) return null;

  const { peopleById, allUnions } = loadKinshipDataset();
  const focal = peopleById.get(member.id);
  if (!focal) return null;

  const layoutUnions = toLayoutUnions(allUnions);
  if (options.ensurePersonIds?.length) {
    const pathGens = generationsToIncludeKinshipPath(
      focal.id,
      options.ensurePersonIds,
      layoutUnions,
    );
    generationsUp = Math.max(generationsUp, pathGens.generationsUp);
    generationsDown = Math.max(generationsDown, pathGens.generationsDown);
  }

  const included = collectIncludedPersonIds(
    focal.id,
    layoutUnions,
    generationsUp,
    generationsDown,
    siblingSteps,
    cousinDegree,
  );
  for (const id of options.ensurePersonIds ?? []) {
    if (peopleById.has(id)) included.add(id);
  }

  const layoutPeople = new Map(
    [...included]
      .map((id) => peopleById.get(id))
      .filter((p): p is KinshipPerson => !!p)
      .map((p) => [
        p.id,
        { id: p.id, birthDate: p.birthDate, gender: p.gender },
      ]),
  );

  const focalPersonUnionIds = layoutUnions
    .filter((u) => u.partner1Id === focal.id || u.partner2Id === focal.id)
    .map((u) => u.id);
  const preferredFocalUnionId =
    options.focalUnionId ??
    resolvePrimaryTreeUnionId(
      getPrimaryTreeUnionId(focal.id),
      focalPersonUnionIds,
    ) ??
    undefined;

  const cousinNetworkPosterSpread =
    generationsUp >= 2 || cousinDegree >= 1 || siblingSteps >= 1;

  const {
    positions,
    edges: layoutEdges,
    focalPartnerIds,
    focalUnionId,
    focalUnionIds,
  } = layoutMarriageCentricGraph(
    focal.id,
    layoutPeople,
    toLayoutUnions(allUnions),
    included,
    0,
    0,
    {
      preferredFocalUnionId,
      phoneSingleParentSide: false,
      maxAncestorGenerations: generationsUp,
      cousinNetworkPosterSpread,
    },
  );

  const nodes: FamilyGraphNode[] = [];
  for (const personId of included) {
    const pos = positions.get(personId);
    const p = peopleById.get(personId);
    if (!pos || !p) continue;
    const hints = getExplorationHints(personId, included, allUnions);
    const isEgo = personId === focal.id;
    nodes.push({
      id: personId,
      type: "person",
      position: { x: pos.x, y: pos.y },
      data: {
        person: toGraphPerson(p),
        isFocal: isEgo,
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
    label: e.label,
  }));

  const unionViews = getLocalUnionsForPerson(focal.id);
  const marriageLabelForUnion = (unionId: string): string => {
    const match = unionViews.find((u) => u.id === unionId);
    const wedding = formatDisplayDate(match?.marriageDate ?? undefined);
    return wedding ? `Married ${wedding}` : "Married";
  };

  const focalMarriageBands: { partnerId: string; label: string }[] = [];
  for (let i = 0; i < (focalUnionIds?.length ?? 0); i++) {
    const unionId = focalUnionIds[i];
    const partnerId = focalPartnerIds[i];
    if (!unionId || !partnerId) continue;
    focalMarriageBands.push({
      partnerId,
      label: marriageLabelForUnion(unionId),
    });
  }

  const focalMarriageLabel =
    focalUnionId ? marriageLabelForUnion(focalUnionId) : null;

  return {
    focalPersonId: focal.id,
    focalUnionId,
    focalUnionIds,
    focalPartnerIds,
    focalMarriageLabel,
    focalMarriageBands,
    nodes,
    edges,
  };
}
