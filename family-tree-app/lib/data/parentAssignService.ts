import type { StorageMode } from "@/lib/data/types";
import { createLocalMember, getLocalMemberById } from "@/lib/db/localRepository";
import { setLocalParents } from "@/lib/db/localRepository.ext";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import {
  parentSlotGender,
  splitParentsByRole,
  type ParentSlot,
} from "@/lib/rules/parentSlots";

function requireLocal(mode: StorageMode): void {
  if (mode !== "local") {
    throw new Error("Parent assignment is only available in the private archive.");
  }
}

export type AssignParentSlotResult =
  | { status: "complete"; unionId: string }
  | {
      status: "needs_other_parent";
      stagedParentId: string;
      otherSlot: ParentSlot;
      stagedSlot: ParentSlot;
    };

type AssignInput = {
  childId: string;
  slot: ParentSlot;
  parentPersonId: string;
  staged?: { parentId: string; slot: ParentSlot } | null;
};

function resolveParentPair(
  childId: string,
  input: AssignInput,
): AssignParentSlotResult {
  const { peopleById, unionsAsChildFor } = loadKinshipDataset();
  const parents = getParentsForPerson(childId, unionsAsChildFor(childId), peopleById);
  const roles = splitParentsByRole(parents);

  let fatherId = roles.father?.id ?? null;
  let motherId = roles.mother?.id ?? null;

  if (input.staged) {
    if (input.staged.slot === "father") {
      fatherId = input.staged.parentId;
    } else {
      motherId = input.staged.parentId;
    }
  }

  if (input.slot === "father") {
    fatherId = input.parentPersonId;
  } else {
    motherId = input.parentPersonId;
  }

  if (fatherId && motherId) {
    const { unionId } = setLocalParents({
      personId: childId,
      parentAId: fatherId,
      parentBId: motherId,
    });
    return { status: "complete", unionId };
  }

  const stagedParentId = fatherId ?? motherId;
  if (!stagedParentId) {
    throw new Error("Could not stage parent.");
  }
  const otherSlot: ParentSlot = fatherId ? "mother" : "father";
  const stagedSlot: ParentSlot = fatherId ? "father" : "mother";
  return {
    status: "needs_other_parent",
    stagedParentId,
    otherSlot,
    stagedSlot,
  };
}

export function assignParentSlot(mode: StorageMode, input: AssignInput): AssignParentSlotResult {
  requireLocal(mode);
  if (!getLocalMemberById(input.childId)) {
    throw new Error("Person not found.");
  }
  if (input.parentPersonId === input.childId) {
    throw new Error("A person cannot be their own parent.");
  }
  return resolveParentPair(input.childId, input);
}

export function createAndAssignParentSlot(
  mode: StorageMode,
  input: {
    childId: string;
    slot: ParentSlot;
    firstName: string;
    lastName: string;
    birthDate?: string;
    staged?: { parentId: string; slot: ParentSlot } | null;
  },
): AssignParentSlotResult {
  requireLocal(mode);
  const created = createLocalMember({
    firstName: input.firstName,
    lastName: input.lastName,
    gender: parentSlotGender(input.slot),
    birthDate: input.birthDate,
  });
  return assignParentSlot(mode, {
    childId: input.childId,
    slot: input.slot,
    parentPersonId: created.id,
    staged: input.staged,
  });
}
