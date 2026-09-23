import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";

type AdjacencyEdge = { to: string; relation: string };

function buildAdjacency(
  people: KinshipPerson[],
  unions: KinshipUnionRecord[],
): Map<string, AdjacencyEdge[]> {
  const adj = new Map<string, AdjacencyEdge[]>();
  const add = (from: string, to: string, relation: string) => {
    const list = adj.get(from) ?? [];
    list.push({ to, relation });
    adj.set(from, list);
  };

  for (const u of unions) {
    add(u.partner1Id, u.partner2Id, "spouse");
    add(u.partner2Id, u.partner1Id, "spouse");
    for (const cs of u.childships) {
      add(u.partner1Id, cs.childId, "parent");
      add(u.partner2Id, cs.childId, "parent");
      add(cs.childId, u.partner1Id, "child");
      add(cs.childId, u.partner2Id, "child");
    }
  }

  for (const p of people) {
    if (!adj.has(p.id)) adj.set(p.id, []);
  }
  return adj;
}

function describePath(
  steps: { fromId: string; toId: string; relation: string }[],
  peopleById: Map<string, KinshipPerson>,
): string {
  return steps
    .map((s) => {
      const from = peopleById.get(s.fromId);
      const to = peopleById.get(s.toId);
      const fromName = from ? from.firstName : "?";
      const toName = to ? to.firstName : "?";
      return `${fromName} → (${s.relation}) → ${toName}`;
    })
    .join("; ");
}

export function computeRelationSummary(
  fromPersonId: string,
  toPersonId: string,
): string {
  const { peopleById, allUnions } = loadKinshipDataset();
  const from = peopleById.get(fromPersonId);
  const to = peopleById.get(toPersonId);
  if (!from || !to) {
    return "We could not find both people in your private archive.";
  }
  if (from.id === to.id) {
    return "Same person";
  }

  const people = [...peopleById.values()];
  const adj = buildAdjacency(people, allUnions);
  const queue: { id: string; path: { fromId: string; toId: string; relation: string }[] }[] =
    [{ id: from.id, path: [] }];
  const visited = new Set<string>([from.id]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = adj.get(current.id) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      const step = {
        fromId: current.id,
        toId: edge.to,
        relation: edge.relation,
      };
      const newPath = [...current.path, step];
      if (edge.to === to.id) {
        return describePath(newPath, peopleById);
      }
      visited.add(edge.to);
      queue.push({ id: edge.to, path: newPath });
    }
  }

  return "No relationship path found in your family graph.";
}
