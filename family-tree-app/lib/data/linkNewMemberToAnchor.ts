import { assignParentSlot } from "@/lib/data/parentAssignService";
import { linkChildToParent, linkSpouse } from "@/lib/data/personService";
import { getLocalMemberById } from "@/lib/db/localRepository.ext";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { setLocalParents } from "@/lib/db/localRepository.ext";
import { loadLocalRuleGraphFromKinship } from "@/lib/kinship/ruleGraphFromDataset";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import type { StorageMode } from "@/lib/data/types";
import type { ParentSlot } from "@/lib/rules/parentSlots";
import { parentPairAfterNewParent } from "../../../shared/genealogy/parentSlotRules";
import {
  assertCanAssignParents,
  assertCanCreateMarriage,
  spouseIds,
  RelationshipRuleError,
} from "../../../shared/relationshipRules";

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

  const graph = loadLocalRuleGraphFromKinship();
  const newPerson = getLocalMemberById(newPersonId);
  if (!newPerson) {
    throw new RelationshipRuleError("NOT_FOUND", "New member was not saved.");
  }

  switch (relation) {
    case "spouse":
      assertCanCreateMarriage(graph, anchors[0]!, newPersonId);
      linkSpouse(mode, { personId: anchors[0]!, spouseId: newPersonId });
      return;
    case "parent": {
      const childId = anchors[0]!;
      const gender = newPerson.gender as "MALE" | "FEMALE" | "OTHER";
      const pair = parentPairAfterNewParent(graph, childId, newPersonId, gender);
      if (!pair) {
        throw new RelationshipRuleError(
          "PARENTS_MUST_DIFFER",
          "This child already has parents recorded for that role.",
        );
      }
      assertCanAssignParents(graph, childId, pair.parentAId, pair.parentBId);
      const slot: ParentSlot = newPerson.gender === "FEMALE" ? "mother" : "father";
      assignParentSlot(mode, {
        childId,
        slot,
        parentPersonId: newPersonId,
      });
      return;
    }
    case "child": {
      if (anchors.length === 1) {
        const parentId = anchors[0]!;
        const anchor = getLocalMemberById(parentId);
        const spouses = [...spouseIds(graph, parentId)];
        const coParent = spouses[0];
        if (coParent) {
          assertCanAssignParents(graph, newPersonId, parentId, coParent);
        } else {
          const pair = parentPairAfterNewParent(
            graph,
            newPersonId,
            parentId,
            anchor?.gender ?? "MALE",
          );
          if (!pair) {
            throw new RelationshipRuleError(
              "PARENTS_MUST_DIFFER",
              "Unable to record parents for this child.",
            );
          }
          assertCanAssignParents(graph, newPersonId, pair.parentAId, pair.parentBId);
        }
        linkChildToParent(mode, parentId, newPersonId);
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
      assertCanAssignParents(graph, newPersonId, fatherId, motherId);
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
      const { peopleById, unionsAsChildFor } = loadKinshipDataset();
      let parentAId: string | null = null;
      let parentBId: string | null = null;
      for (const anchorPersonId of anchors) {
        const parents = getParentsForPerson(
          anchorPersonId,
          unionsAsChildFor(anchorPersonId),
          peopleById,
        );
        if (parents.length < 1) {
          throw new Error("Record parents for each selected sibling before linking.");
        }
        const father = parents.find((p) => p.gender === "MALE");
        const mother = parents.find((p) => p.gender === "FEMALE");
        const aId = father?.id ?? parents[0]!.id;
        const bId =
          mother?.id ?? parents.find((p) => p.id !== aId)?.id ?? aId;
        const key = [aId, bId].sort().join("|");
        const expected = parentAId && parentBId
          ? [parentAId, parentBId].sort().join("|")
          : null;
        if (expected && expected !== key) {
          throw new Error(
            "Selected siblings do not share the same parents. Pick siblings from one family.",
          );
        }
        parentAId = aId;
        parentBId = bId;
      }
      assertCanAssignParents(graph, newPersonId, parentAId!, parentBId!);
      setLocalParents({
        personId: newPersonId,
        parentAId: parentAId!,
        parentBId: parentBId!,
      });
      return;
    }
    default: {
      const _exhaustive: never = relation;
      return _exhaustive;
    }
  }
}
