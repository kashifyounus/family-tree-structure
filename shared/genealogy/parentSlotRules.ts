/**
 * Parent “slots” (father / mother) for genealogy business rules.
 * Unknown co-parent rows fill a slot in storage but leave the opposite real-parent slot open.
 */

import {
  isUnknownCoParentFamilyCode,
  pairParentsWithUnknownCoParent,
} from "../unknownCoParent";
import { parentIdsOf, type RuleGender, type RuleGraph } from "../relationshipRules";

function personById(graph: RuleGraph, id: string) {
  return graph.people.find((p) => p.id === id);
}

export function isUnknownCoParentInGraph(
  graph: RuleGraph,
  personId: string,
): boolean {
  const p = personById(graph, personId);
  return Boolean(p?.familyCode && isUnknownCoParentFamilyCode(p.familyCode));
}

/** Real (non-sentinel) parents by conventional father/mother roles. */
export function realParentRoles(
  graph: RuleGraph,
  childId: string,
): { fatherId: string | null; motherId: string | null } {
  const ids = parentIdsOf(graph, childId);
  let fatherId: string | null = null;
  let motherId: string | null = null;
  for (const id of ids) {
    if (isUnknownCoParentInGraph(graph, id)) continue;
    const p = personById(graph, id);
    if (!p) continue;
    if (p.gender === "MALE" && !fatherId) fatherId = id;
    else if (p.gender === "FEMALE" && !motherId) motherId = id;
    else if (!fatherId) fatherId = id;
    else if (!motherId) motherId = id;
  }
  return { fatherId, motherId };
}

export function hasKnownParent(graph: RuleGraph, childId: string): boolean {
  const { fatherId, motherId } = realParentRoles(graph, childId);
  return Boolean(fatherId || motherId);
}

/** Both father and mother slots are filled with real (non-sentinel) people. */
export function bothRealParentsFilled(
  graph: RuleGraph,
  childId: string,
): boolean {
  const { fatherId, motherId } = realParentRoles(graph, childId);
  return Boolean(fatherId && motherId);
}

export function unknownPlaceholderIds(graph: RuleGraph): {
  maleId: string | null;
  femaleId: string | null;
} {
  let maleId: string | null = null;
  let femaleId: string | null = null;
  for (const p of graph.people) {
    if (!p.familyCode || !isUnknownCoParentFamilyCode(p.familyCode)) continue;
    if (p.gender === "MALE") maleId = p.id;
    if (p.gender === "FEMALE") femaleId = p.id;
  }
  return { maleId, femaleId };
}

/** Full parent pair for a child, using unknown placeholders when a slot is empty. */
export function resolvedParentPairForChild(
  graph: RuleGraph,
  childId: string,
): { parentAId: string; parentBId: string } | null {
  const { fatherId, motherId } = realParentRoles(graph, childId);
  const { maleId, femaleId } = unknownPlaceholderIds(graph);
  if (!maleId || !femaleId) {
    if (fatherId && motherId) {
      return { parentAId: fatherId, parentBId: motherId };
    }
    return null;
  }
  return pairParentsWithUnknownCoParent({
    fatherId,
    motherId,
    unknownMaleId: maleId,
    unknownFemaleId: femaleId,
  });
}

/** After assigning `newParentId` (with `newParentGender`) to `childId`. */
export function parentPairAfterNewParent(
  graph: RuleGraph,
  childId: string,
  newParentId: string,
  newParentGender: RuleGender,
): { parentAId: string; parentBId: string } | null {
  const { fatherId, motherId } = realParentRoles(graph, childId);
  let father = fatherId;
  let mother = motherId;
  if (newParentGender === "MALE") father = newParentId;
  else if (newParentGender === "FEMALE") mother = newParentId;
  else if (!father) father = newParentId;
  else if (!mother) mother = newParentId;
  else return null;

  const { maleId, femaleId } = unknownPlaceholderIds(graph);
  if (!maleId || !femaleId) {
    if (!father || !mother) return null;
    return { parentAId: father, parentBId: mother };
  }
  return pairParentsWithUnknownCoParent({
    fatherId: father,
    motherId: mother,
    unknownMaleId: maleId,
    unknownFemaleId: femaleId,
  });
}

export function openParentSlotForGender(
  graph: RuleGraph,
  childId: string,
  gender: RuleGender,
): boolean {
  const { fatherId, motherId } = realParentRoles(graph, childId);
  switch (gender) {
    case "MALE":
      return !fatherId;
    case "FEMALE":
      return !motherId;
    case "OTHER":
      return !fatherId || !motherId;
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}
