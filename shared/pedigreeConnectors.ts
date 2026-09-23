/**
 * Pedigree-style connector segments (couple bar + T-junction to children).
 */

export type PedigreeNodeBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PedigreeGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "spouse" | "parent" | "child" | string;
  label?: string;
};

export type PedigreeSegment = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: "spouse" | "parent" | "union-stem" | "union-branch";
};

function bottomCenter(box: PedigreeNodeBox) {
  return { x: box.x + box.width / 2, y: box.y + box.height };
}

function topCenter(box: PedigreeNodeBox) {
  return { x: box.x + box.width / 2, y: box.y };
}

export function buildPedigreeConnectorSegments(
  nodes: PedigreeNodeBox[],
  edges: PedigreeGraphEdge[],
): PedigreeSegment[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const segments: PedigreeSegment[] = [];

  const spouseEdges = edges.filter((e) => e.type === "spouse");
  const parentEdges = edges.filter((e) => e.type === "parent");
  const childEdges = edges.filter((e) => e.type === "child");

  for (const e of spouseEdges) {
    const a = byId.get(e.source);
    const b = byId.get(e.target);
    if (!a || !b) continue;
    const p1 = bottomCenter(a);
    const p2 = bottomCenter(b);
    segments.push({
      id: `spouse-line-${e.id}`,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      kind: "spouse",
    });
  }

  for (const e of parentEdges) {
    const a = byId.get(e.source);
    const b = byId.get(e.target);
    if (!a || !b) continue;
    const p1 = bottomCenter(a);
    const p2 = topCenter(b);
    segments.push({
      id: `parent-line-${e.id}`,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      kind: "parent",
    });
  }

  const childrenByUnion = new Map<string, PedigreeGraphEdge[]>();
  for (const e of childEdges) {
    const unionId = e.label ?? `union-${e.source}`;
    const list = childrenByUnion.get(unionId) ?? [];
    list.push(e);
    childrenByUnion.set(unionId, list);
  }

  for (const [unionId, group] of childrenByUnion) {
    const focalId = group[0]?.source;
    if (!focalId) continue;
    const focalBox = byId.get(focalId);
    if (!focalBox) continue;

    const spouseEdge = spouseEdges.find(
      (e) =>
        e.label === unionId &&
        (e.source === focalId || e.target === focalId),
    );
    let unionMid = bottomCenter(focalBox);
    if (spouseEdge) {
      const otherId =
        spouseEdge.source === focalId ? spouseEdge.target : spouseEdge.source;
      const otherBox = byId.get(otherId);
      if (otherBox) {
        const p1 = bottomCenter(focalBox);
        const p2 = bottomCenter(otherBox);
        unionMid = { x: (p1.x + p2.x) / 2, y: Math.max(p1.y, p2.y) };
      }
    }

    const childTargets = group
      .map((e) => byId.get(e.target))
      .filter((b): b is PedigreeNodeBox => !!b);
    if (childTargets.length === 0) continue;

    const childTops = childTargets.map((c) => topCenter(c));
    const railY =
      unionMid.y +
      Math.max(24, Math.min(48, (childTops[0].y - unionMid.y) * 0.45));

    segments.push({
      id: `union-stem-${unionId}`,
      x1: unionMid.x,
      y1: unionMid.y,
      x2: unionMid.x,
      y2: railY,
      kind: "union-stem",
    });

    if (childTops.length > 1) {
      const xs = childTops.map((p) => p.x);
      segments.push({
        id: `union-rail-${unionId}`,
        x1: Math.min(...xs),
        y1: railY,
        x2: Math.max(...xs),
        y2: railY,
        kind: "union-branch",
      });
    }

    for (const child of childTargets) {
      const top = topCenter(child);
      segments.push({
        id: `union-drop-${unionId}-${child.id}`,
        x1: top.x,
        y1: railY,
        x2: top.x,
        y2: top.y,
        kind: "union-branch",
      });
    }
  }

  return segments;
}
