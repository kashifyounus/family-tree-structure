/**
 * Business process: who can appear in the add-member anchor picker for each role.
 */

import {
  assertCanAssignParents,
  assertCanCreateMarriage,
  spouseIds,
  type RuleGender,
  type RuleGraph,
} from "../relationshipRules";
import {
  hasKnownParent,
  openParentSlotForGender,
  parentPairAfterNewParent,
  resolvedParentPairForChild,
} from "./parentSlotRules";

export const PROSPECTIVE_MEMBER_ID = "__prospective_member__";

export function withProspectiveMember(
  graph: RuleGraph,
  gender: RuleGender,
): RuleGraph {
  if (graph.people.some((p) => p.id === PROSPECTIVE_MEMBER_ID)) {
    return graph;
  }
  return {
    ...graph,
    people: [
      ...graph.people,
      {
        id: PROSPECTIVE_MEMBER_ID,
        gender,
        birthDate: null,
        deathDate: null,
      },
    ],
  };
}

function canAssignParentsToChild(
  graph: RuleGraph,
  childId: string,
  parentAId: string,
  parentBId: string,
  newMemberGender: RuleGender,
): boolean {
  const extended = withProspectiveMember(graph, newMemberGender);
  try {
    assertCanAssignParents(extended, childId, parentAId, parentBId);
    return true;
  } catch {
    return false;
  }
}

/** New member will marry the anchor. */
export function canSelectAnchorForNewSpouse(
  graph: RuleGraph,
  anchorPersonId: string,
  newMemberGender: RuleGender,
): boolean {
  const extended = withProspectiveMember(graph, newMemberGender);
  try {
    assertCanCreateMarriage(extended, anchorPersonId, PROSPECTIVE_MEMBER_ID);
    return true;
  } catch {
    return false;
  }
}

/** New member will be recorded as a parent of the anchor child. */
export function canSelectChildAnchorForNewParent(
  graph: RuleGraph,
  childId: string,
  newMemberGender: RuleGender,
): boolean {
  if (!openParentSlotForGender(graph, childId, newMemberGender)) {
    return false;
  }
  const pair = parentPairAfterNewParent(
    graph,
    childId,
    PROSPECTIVE_MEMBER_ID,
    newMemberGender,
  );
  if (!pair) return false;
  return canAssignParentsToChild(
    graph,
    childId,
    pair.parentAId,
    pair.parentBId,
    newMemberGender,
  );
}

/** New member will be a child of the anchor parent (and spouse when present). */
export function canSelectParentAnchorForNewChild(
  graph: RuleGraph,
  parentId: string,
  newMemberGender: RuleGender,
): boolean {
  if (!graph.people.some((p) => p.id === parentId)) return false;
  const spouses = [...spouseIds(graph, parentId)];
  if (spouses.length > 0) {
    for (const coParent of spouses) {
      if (
        canAssignParentsToChild(
          graph,
          PROSPECTIVE_MEMBER_ID,
          parentId,
          coParent,
          newMemberGender,
        )
      ) {
        return true;
      }
    }
    return false;
  }
  const pair = parentPairAfterNewParent(
    graph,
    PROSPECTIVE_MEMBER_ID,
    parentId,
    graph.people.find((p) => p.id === parentId)?.gender ?? "MALE",
  );
  if (!pair) return false;
  return canAssignParentsToChild(
    graph,
    PROSPECTIVE_MEMBER_ID,
    pair.parentAId,
    pair.parentBId,
    newMemberGender,
  );
}

/** New member will share parents with the anchor sibling. */
export function canSelectSiblingAnchorForNewSibling(
  graph: RuleGraph,
  siblingId: string,
  newMemberGender: RuleGender,
): boolean {
  if (!hasKnownParent(graph, siblingId)) {
    return false;
  }
  const pair = resolvedParentPairForChild(graph, siblingId);
  if (!pair) return false;
  return canAssignParentsToChild(
    graph,
    PROSPECTIVE_MEMBER_ID,
    pair.parentAId,
    pair.parentBId,
    newMemberGender,
  );
}
