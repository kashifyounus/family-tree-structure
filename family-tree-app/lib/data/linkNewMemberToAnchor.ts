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
  linkNewMemberToAnchors(mode, newPersonId, [anchorPersonId], relation);
}

export function linkNewMemberToAnchors(
  mode: StorageMode,
  newPersonId: string,
  anchorPersonIds: string[],
  relation: NewMemberRelationKind,
): void {
  if (mode !== "local") {
    throw new Error("Relationship linking is only available in the private archive.");
  }
  const anchors = [...new Set(anchorPersonIds.filter(Boolean))];
  if (anchors.length === 0) {
    throw new Error("Choose at least one person to link.");
  }
  if (anchors.some((id) => id === newPersonId)) {
    throw new Error("Choose a different person to link.");
  }

  switch (relation) {
    case "spouse":
      linkSpouse(mode, { personId: anchors[0]!, spouseId: newPersonId });
      return;
    case "parent": {
      const newPerson = getLocalMemberById(newPersonId);
      const slot: ParentSlot = newPerson?.gender === "FEMALE" ? "mother" : "father";
      assignParentSlot(mode, {
        childId: anchors[0]!,
        slot,
        parentPersonId: newPersonId,
      });
      return;
    }
    case "child": {
      if (anchors.length === 1) {
        linkChildToParent(mode, anchors[0]!, newPersonId);
        return;
      }
      const people = anchors.map((id) => getLocalMemberById(id)).filter(Boolean);
      let fatherId: string | null = null;
      let motherId: string | null = null;
      for (const p of people) {
        if (!p) continue;
        if (p.gender === "MALE" && !fatherId) fatherId = p.id;
        else if (p.gender === "FEMALE" && !motherId) motherId = p.id;
      }
      if (!fatherId) fatherId = anchors[0]!;
      if (!motherId) motherId = anchors.find((id) => id !== fatherId) ?? fatherId;
      setLocalParents({
        personId: newPersonId,
        parentAId: fatherId,
        parentBId: motherId,
      });
      for (const extraId of anchors) {
        if (extraId === fatherId || extraId === motherId) continue;
        linkChildToParent(mode, extraId, newPersonId);
      }
      return;
    }
    case "sibling": {
      const anchorPersonId = anchors[0]!;
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
