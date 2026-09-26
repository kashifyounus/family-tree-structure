import type { RuleGender } from "./relationshipRules";

/** Stable family codes for sentinel co-parent rows (never shown as primary labels). */
export const UNKNOWN_COPARENT_FAMILY_CODE = {
  MALE: "__UNK_COPARENT_M__",
  FEMALE: "__UNK_COPARENT_F__",
} as const;

export const UNKNOWN_COPARENT_DISPLAY = {
  firstName: "Unknown",
  lastName: "Parent",
} as const;

export function isUnknownCoParentFamilyCode(familyCode: string): boolean {
  return (
    familyCode === UNKNOWN_COPARENT_FAMILY_CODE.MALE ||
    familyCode === UNKNOWN_COPARENT_FAMILY_CODE.FEMALE
  );
}

export function unknownCoParentGenderFromFamilyCode(
  familyCode: string,
): RuleGender | null {
  if (familyCode === UNKNOWN_COPARENT_FAMILY_CODE.MALE) return "MALE";
  if (familyCode === UNKNOWN_COPARENT_FAMILY_CODE.FEMALE) return "FEMALE";
  return null;
}

export function unknownCoParentFamilyCodeForGender(gender: RuleGender): string {
  switch (gender) {
    case "MALE":
      return UNKNOWN_COPARENT_FAMILY_CODE.MALE;
    case "FEMALE":
      return UNKNOWN_COPARENT_FAMILY_CODE.FEMALE;
    case "OTHER":
      return UNKNOWN_COPARENT_FAMILY_CODE.MALE;
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}

/** Gender for the missing parent slot when only one role is known. */
export function missingParentSlotGender(
  knownSlot: "father" | "mother",
): RuleGender {
  return knownSlot === "father" ? "FEMALE" : "MALE";
}

export function formatPersonDisplayName(input: {
  firstName: string;
  lastName: string;
  familyCode: string;
}): string {
  if (isUnknownCoParentFamilyCode(input.familyCode)) {
    return UNKNOWN_COPARENT_DISPLAY.firstName;
  }
  return `${input.firstName} ${input.lastName}`.trim();
}

export function pairParentsWithUnknownCoParent(input: {
  fatherId: string | null;
  motherId: string | null;
  unknownMaleId: string;
  unknownFemaleId: string;
}): { parentAId: string; parentBId: string } | null {
  const { fatherId, motherId, unknownMaleId, unknownFemaleId } = input;
  if (fatherId && motherId) {
    return { parentAId: fatherId, parentBId: motherId };
  }
  if (fatherId && !motherId) {
    return { parentAId: fatherId, parentBId: unknownFemaleId };
  }
  if (!fatherId && motherId) {
    return { parentAId: unknownMaleId, parentBId: motherId };
  }
  return null;
}
