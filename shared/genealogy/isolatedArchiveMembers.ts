/**
 * Members with no recorded family links (no parents, no marriage, no children).
 */

export type ArchiveLinkUnion = {
  partner1Id: string;
  partner2Id: string;
  childships: { childId: string }[];
};

export type ArchiveLinkPerson = {
  id: string;
  familyCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export function listIsolatedArchiveMemberIds(
  people: readonly ArchiveLinkPerson[],
  unions: readonly ArchiveLinkUnion[],
): string[] {
  const linked = new Set<string>();

  for (const u of unions) {
    linked.add(u.partner1Id);
    linked.add(u.partner2Id);
    for (const cs of u.childships) {
      linked.add(cs.childId);
      linked.add(u.partner1Id);
      linked.add(u.partner2Id);
    }
  }

  return people
    .filter((p) => !linked.has(p.id))
    .map((p) => p.id);
}
