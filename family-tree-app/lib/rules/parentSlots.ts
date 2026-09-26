import type { Gender } from "@/lib/data/types";
import type { KinshipPerson } from "@/lib/kinship/types";

export type ParentSlot = "father" | "mother";

export function parentSlotGender(slot: ParentSlot): Gender {
  return slot === "father" ? "MALE" : "FEMALE";
}

export function splitParentsByRole(parents: KinshipPerson[]): {
  father: KinshipPerson | null;
  mother: KinshipPerson | null;
} {
  const father = parents.find((p) => p.gender === "MALE") ?? null;
  const mother = parents.find((p) => p.gender === "FEMALE") ?? null;
  if (father || mother) {
    return { father, mother };
  }
  if (parents.length === 0) {
    return { father: null, mother: null };
  }
  if (parents.length === 1) {
    return { father: parents[0], mother: null };
  }
  return { father: parents[0], mother: parents[1] };
}

export type ParentMergeResult =
  | { complete: true; parentAId: string; parentBId: string }
  | { complete: false; stagedParentId: string; otherSlot: ParentSlot };

export function mergeParentSlot(
  slot: ParentSlot,
  newParentId: string,
  existing: { father: KinshipPerson | null; mother: KinshipPerson | null },
): ParentMergeResult {
  const fatherId = slot === "father" ? newParentId : (existing.father?.id ?? null);
  const motherId = slot === "mother" ? newParentId : (existing.mother?.id ?? null);

  if (fatherId && motherId) {
    return { complete: true, parentAId: fatherId, parentBId: motherId };
  }

  return {
    complete: false,
    stagedParentId: newParentId,
    otherSlot: slot === "father" ? "mother" : "father",
  };
}

export function defaultParentSlotForOpen(
  parents: KinshipPerson[],
  staged: { slot: ParentSlot } | null,
): ParentSlot {
  if (staged) {
    return staged.slot === "father" ? "mother" : "father";
  }
  const { father, mother } = splitParentsByRole(parents);
  if (!father) return "father";
  if (!mother) return "mother";
  return "father";
}
