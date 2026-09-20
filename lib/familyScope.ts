import type { UnionRecord } from "@/lib/kinship";

export function getConnectedPersonIds(
  rootId: string,
  unions: UnionRecord[],
): Set<string> {
  const visited = new Set<string>([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const u of unions) {
      const related: string[] = [];
      if (u.partner1Id === id || u.partner2Id === id) {
        related.push(u.partner1Id, u.partner2Id);
      }
      for (const c of u.childships) {
        if (c.childId === id) {
          related.push(u.partner1Id, u.partner2Id, c.childId);
        }
        if (u.partner1Id === id || u.partner2Id === id) {
          related.push(c.childId);
        }
      }
      for (const pid of related) {
        if (!visited.has(pid)) {
          visited.add(pid);
          queue.push(pid);
        }
      }
    }
  }

  return visited;
}
