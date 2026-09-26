import type { MemberRecord } from "@/lib/data/types";

/** Living archive members with the same first + last (case-insensitive). */
export function livingNameCollisionCount(
  member: Pick<MemberRecord, "id" | "firstName" | "lastName" | "deathDate" | "nickname">,
  all: Pick<MemberRecord, "id" | "firstName" | "lastName" | "deathDate">[],
): number {
  if (member.nickname?.trim()) return 0;
  const first = member.firstName.trim().toLowerCase();
  const last = member.lastName.trim().toLowerCase();
  if (!first || !last) return 0;
  return all.filter((m) => {
    if (m.id === member.id) return false;
    if (m.deathDate) return false;
    return (
      m.firstName.trim().toLowerCase() === first &&
      m.lastName.trim().toLowerCase() === last
    );
  }).length;
}
