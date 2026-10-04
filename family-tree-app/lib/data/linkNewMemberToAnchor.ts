import { assignParentSlot } from "@/lib/data/parentAssignService";
import { linkChildToParent, linkSpouse } from "@/lib/data/personService";
import { getLocalMemberById } from "@/lib/db/localRepository.ext";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { setLocalParents } from "@/lib/db/localRepository.ext";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import type { StorageMode } from "@/lib/data/types";
import type { ParentSlot } from "@/lib/rules/parentSlots";

export type NewMemberRelationKind = "parent" | "child" | "spouse" | "sibling";

export function linkNewMemberToAnchor(
  mode: StorageMode,
  newPersonId: string,
  anchorPersonId: string,
  relation: NewMemberRelationKind,
): void {
  if (mode !== "local") {
    throw new Error("Relationship linking is only available in the private archive.");
  }
  if (newPersonId === anchorPersonId) {
    throw new Error("Choose a different person to link.");
  }

  switch (relation) {
    case "spouse":
      linkSpouse(mode, { personId: anchorPersonId, spouseId: newPersonId });
      return;
    case "child":
      linkChildToParent(mode, anchorPersonId, newPersonId);
      return;
    case "parent": {
      const newPerson = getLocalMemberById(newPersonId);
      const slot: ParentSlot = newPerson?.gender === "FEMALE" ? "mother" : "father";
      assignParentSlot(mode, {
        childId: anchorPersonId,
        slot,
        parentPersonId: newPersonId,
      });
      return;
    }
    case "sibling": {
      const { peopleById, unionsAsChildFor } = loadKinshipDataset();
      const parents = getParentsForPerson(
        anchorPersonId,
        unionsAsChildFor(anchorPersonId),
        peopleById,
      );
      if (parents.length < 1) {
        throw new Error("Record parents for this person before linking a sibling.");
      }
      const father = parents.find((p) => p.gender === "MALE");
      const mother = parents.find((p) => p.gender === "FEMALE");
      const parentAId = father?.id ?? parents[0]!.id;
      const parentBId =
        mother?.id ?? parents.find((p) => p.id !== parentAId)?.id ?? parentAId;
      setLocalParents({
        personId: newPersonId,
        parentAId,
        parentBId,
      });
      return;
    }
    default: {
      const _exhaustive: never = relation;
      return _exhaustive;
    }
  }
}
