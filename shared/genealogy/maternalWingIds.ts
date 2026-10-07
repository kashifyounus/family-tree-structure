import type { MarriageLayoutUnion } from "../marriageTreeLayout";

/** Spouse line and their ancestors/siblings within `included` (mother’s-side wing). */
export function maternalWingPersonIds(
  focalId: string,
  focalPartnerIds: readonly string[],
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
): Set<string> {
  const ids = new Set<string>();
  const queue: string[] = [];

  for (const partnerId of focalPartnerIds) {
    if (!included.has(partnerId)) continue;
    ids.add(partnerId);
    queue.push(partnerId);
  }

  while (queue.length > 0) {
    const personId = queue.pop()!;
    for (const u of unions) {
      if (u.childships.some((c) => c.childId === personId)) {
        for (const parentId of [u.partner1Id, u.partner2Id]) {
          if (included.has(parentId) && !ids.has(parentId)) {
            ids.add(parentId);
            queue.push(parentId);
          }
        }
      }
    }
    for (const u of unions) {
      for (const cs of u.childships) {
        if (cs.childId === personId) continue;
        if (included.has(cs.childId) && !ids.has(cs.childId)) {
          ids.add(cs.childId);
          queue.push(cs.childId);
        }
      }
    }
  }

  ids.delete(focalId);
  return ids;
}
