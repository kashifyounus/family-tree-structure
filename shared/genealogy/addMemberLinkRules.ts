/**
 * Business process: who can appear in the add-member anchor picker for each role.
 */

import {
  assertCanAssignParents,
  assertCanCreateMarriage,
  parentIdsOf,
  spouseIds,
  type RuleGender,
  type RuleGraph,
} from "../relationshipRules";

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
  const existingParents = parentIdsOf(graph, childId);
  if (existingParents.length >= 2) {
    return false;
  }
  const extended = withProspectiveMember(graph, newMemberGender);
  const otherParentId = existingParents[0];
  if (!otherParentId) {
    const spouses = spouseIds(graph, childId);
    if (spouses.has(PROSPECTIVE_MEMBER_ID)) return false;
    return true;
  }
  try {
    assertCanAssignParents(
      extended,
      childId,
      PROSPECTIVE_MEMBER_ID,
      otherParentId,
    );
    return true;
  } catch {
    return false;
  }
}

/** New member will be a child of the anchor parent. */
export function canSelectParentAnchorForNewChild(
  graph: RuleGraph,
  parentId: string,
): boolean {
  if (!graph.people.some((p) => p.id === parentId)) return false;
  const extended = withProspectiveMember(graph, "MALE");
  const spouseList = [...spouseIds(graph, parentId)];
  const coParent = spouseList[0];
  if (!coParent) {
    return true;
  }
  try {
    assertCanAssignParents(
      extended,
      PROSPECTIVE_MEMBER_ID,
      parentId,
      coParent,
    );
    return true;
  } catch {
    return false;
  }
}
