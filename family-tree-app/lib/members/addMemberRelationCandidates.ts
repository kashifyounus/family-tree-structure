import type { BriefMember } from "@/components/members/ExistingMemberPicker";
import type { NewMemberRelationKind } from "@/lib/data/linkNewMemberToAnchor";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import { isUnknownCoParentFamilyCode } from "../../../shared/unknownCoParent";

function isUnknownRow(m: BriefMember): boolean {
  return isUnknownCoParentFamilyCode(m.familyCode);
}

/** Members eligible to link when adding a new person with the given relationship role. */
export function filterAddMemberCandidates(
  relation: NewMemberRelationKind,
  members: BriefMember[],
): BriefMember[] {
  const base = members.filter((m) => !isUnknownRow(m));
  const { peopleById, unionsAsChildFor } = loadKinshipDataset();

  switch (relation) {
    case "parent":
      // New person will be a parent of the selected child.
      return base;
    case "child":
      // New person will be a child of selected parent(s).
      return base.filter((m) => {
        const p = peopleById.get(m.id);
        return !!p;
      });
    case "spouse":
      return base;
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
