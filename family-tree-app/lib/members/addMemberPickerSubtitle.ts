import type { BriefMember } from "@/components/members/ExistingMemberPicker";
import type { Gender } from "@/lib/data/types";
import { formatGender } from "@/lib/format/gender";
import { memberPickerSubtitle } from "@/lib/members/memberPickerSubtitle";
import type { NewMemberRelationKind } from "@/lib/data/linkNewMemberToAnchor";

function genderLabel(gender?: string | null): string {
  if (gender === "MALE" || gender === "FEMALE" || gender === "OTHER") {
    return formatGender(gender as Gender);
  }
  return "Person";
}

/** Relation-aware subtitle for add-member anchor picker. */
export function addMemberPickerSubtitle(
  relation: NewMemberRelationKind,
  member: BriefMember,
): string {
  const details = memberPickerSubtitle(member);
  switch (relation) {
    case "parent":
      return `Will be parent · ${genderLabel(member.gender)}${details ? ` · ${details}` : ""}`;
    case "child":
      return `Will be child of selection · ${genderLabel(member.gender)}${details ? ` · ${details}` : ""}`;
    case "spouse":
      return `Spouse link · ${genderLabel(member.gender)}${details ? ` · ${details}` : ""}`;
    case "sibling":
      return `Shares parents with anchor · ${genderLabel(member.gender)}${details ? ` · ${details}` : ""}`;
    default: {
      const _never: never = relation;
      return _never;
    }
  }
}
