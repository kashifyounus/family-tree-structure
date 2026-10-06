import type { BriefMember } from "@/components/members/ExistingMemberPicker";
import type { Gender } from "@/lib/data/types";
import type { NewMemberRelationKind } from "@/lib/data/linkNewMemberToAnchor";
import { loadLocalRuleGraphFromKinship } from "@/lib/kinship/ruleGraphFromDataset";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import {
  canSelectAnchorForNewSpouse,
  canSelectChildAnchorForNewParent,
  canSelectParentAnchorForNewChild,
} from "../../../shared/genealogy/addMemberLinkRules";
import { isUnknownCoParentFamilyCode } from "../../../shared/unknownCoParent";
import type { RuleGender } from "../../../shared/relationshipRules";

function isUnknownRow(m: BriefMember): boolean {
  return isUnknownCoParentFamilyCode(m.familyCode);
}

function toRuleGender(gender: Gender): RuleGender {
  return gender;
}

/** Members eligible to link when adding a new person with the given relationship role. */
export function filterAddMemberCandidates(
  relation: NewMemberRelationKind,
  members: BriefMember[],
  newMemberGender: Gender = "MALE",
): BriefMember[] {
  const base = members.filter((m) => !isUnknownRow(m));
  const ruleGender = toRuleGender(newMemberGender);
  const graph = loadLocalRuleGraphFromKinship();
  const { peopleById, unionsAsChildFor } = loadKinshipDataset();

  switch (relation) {
    case "parent":
      return base.filter((m) =>
        canSelectChildAnchorForNewParent(graph, m.id, ruleGender),
      );
    case "child":
      return base.filter((m) => canSelectParentAnchorForNewChild(graph, m.id));
    case "spouse":
      return base.filter((m) =>
        canSelectAnchorForNewSpouse(graph, m.id, ruleGender),
      );
    case "sibling":
      return base.filter((m) => {
        const parents = getParentsForPerson(m.id, unionsAsChildFor(m.id), peopleById);
        return parents.length > 0;
      });
    default: {
      const _never: never = relation;
      return _never;
    }
  }
}

export function addMemberSelectionMode(
  relation: NewMemberRelationKind,
): "single" | "multiple" {
  switch (relation) {
    case "parent":
    case "spouse":
      return "single";
    case "child":
    case "sibling":
      return "multiple";
    default: {
      const _never: never = relation;
      return _never;
    }
  }
}
