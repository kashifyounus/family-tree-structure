import type { Gender, RelationshipType } from "@prisma/client";
import type { PersonSummary } from "@/types/family";

export function formatGenderLabel(gender: Gender | string): string {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "OTHER":
      return "Other";
    default:
      return "Not recorded";
  }
}

export function formatRelationshipLabel(type: RelationshipType | string): string {
  switch (type) {
    case "BIOLOGICAL":
      return "Biological";
    case "ADOPTED":
      return "Adopted";
    case "STEP":
      return "Step";
    default:
      return "Not recorded";
  }
}

export function formatRecordDate(iso: string | null | undefined): string {
  if (!iso) return "Not recorded";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function inputDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function personName(person: Pick<PersonSummary, "firstName" | "lastName">): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function spouseTitle(
  viewerGender: Gender,
  otherGender: Gender,
): "Husband" | "Wife" | "Spouse" {
  if (viewerGender === "MALE" && otherGender === "FEMALE") return "Wife";
  if (viewerGender === "FEMALE" && otherGender === "MALE") return "Husband";
  return "Spouse";
}

export function parentTitle(gender: Gender): "Father" | "Mother" | "Parent" {
  switch (gender) {
    case "MALE":
      return "Father";
    case "FEMALE":
      return "Mother";
    case "OTHER":
      return "Parent";
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}
