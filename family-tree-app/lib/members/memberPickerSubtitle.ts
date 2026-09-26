import { formatDisplayDate } from "@/lib/format/displayDate";
import type { MemberRecord } from "@/lib/data/types";

export type BriefMemberRow = {
  id: string;
  name: string;
  familyCode: string;
  birthDate?: string | null;
  currentCity?: string | null;
  gender?: string | null;
};

export function memberPickerSubtitle(member: BriefMemberRow): string {
  const parts: string[] = [];
  const born = formatDisplayDate(member.birthDate ?? undefined);
  if (born) parts.push(`Born ${born}`);
  if (member.currentCity?.trim()) parts.push(member.currentCity.trim());
  if (parts.length > 0) return parts.join(" · ");
  return "Family member";
}

/** Secondary line for Members, Home search, and cards — never exposes family codes. */
export function memberRecordSubtitle(
  member: Pick<MemberRecord, "birthDate" | "currentCity" | "gender">,
): string {
  return memberPickerSubtitle({
    id: "",
    name: "",
    familyCode: "",
    birthDate: member.birthDate,
    currentCity: member.currentCity,
    gender: member.gender,
  });
}

export function memberInitials(name: string): string {
  const bits = name.trim().split(/\s+/).filter(Boolean);
  if (bits.length === 0) return "?";
  if (bits.length === 1) return bits[0].slice(0, 2).toUpperCase();
  return (bits[0][0] + bits[bits.length - 1][0]).toUpperCase();
}
