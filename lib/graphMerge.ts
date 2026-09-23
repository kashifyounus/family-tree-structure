import type { FamilyGraph, FamilyGraphEdge, FamilyGraphNode } from "@/types/family";

export function mergeFamilyGraphs(
  base: FamilyGraph,
  extension: FamilyGraph,
): FamilyGraph {
  const nodeMap = new Map<string, FamilyGraphNode>();
  for (const n of base.nodes) nodeMap.set(n.id, n);
  for (const n of extension.nodes) {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
  }

  const edgeMap = new Map<string, FamilyGraphEdge>();
  for (const e of base.edges) edgeMap.set(e.id, e);
  for (const e of extension.edges) {
    if (!edgeMap.has(e.id)) edgeMap.set(e.id, e);
  }

  return {
    focalPersonId: base.focalPersonId,
    focalUnionId: base.focalUnionId,
    focalUnionIds: base.focalUnionIds,
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  };
}
