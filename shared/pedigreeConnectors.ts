/**
 * Pedigree v4 — orthogonal connector segments (H/V only).
 */

import {
  PEDIGREE_MIN_L_JOG,
  PEDIGREE_STEM_CLEARANCE,
} from "./pedigreeLayoutTokens";

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

function leftMid(box: PedigreeNodeBox) {
  return { x: box.x, y: box.y + box.height / 2 };
}

function rightMid(box: PedigreeNodeBox) {
  return { x: box.x + box.width, y: box.y + box.height / 2 };
}

function pushOrthogonalParentChild(
  segments: PedigreeSegment[],
  id: string,
  parent: PedigreeNodeBox,
  child: PedigreeNodeBox,
): void {
  const from = bottomCenter(parent);
  const to = topCenter(child);
  if (Math.abs(from.x - to.x) < 0.5) {
    segments.push({
      id: `parent-line-${id}`,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      kind: "parent",
    });
    return;
  }

  const span = to.y - from.y;
  const midY =
    from.y +
    Math.max(
      PEDIGREE_STEM_CLEARANCE,
      Math.min(span * 0.5, span - PEDIGREE_STEM_CLEARANCE),
    );

  segments.push({
    id: `parent-v1-${id}`,
    x1: from.x,
    y1: from.y,
    x2: from.x,
    y2: midY,
    kind: "parent",
  });

  let x1 = from.x;
  let x2 = to.x;
  if (Math.abs(x2 - x1) < PEDIGREE_MIN_L_JOG) {
    const expand = (PEDIGREE_MIN_L_JOG - Math.abs(x2 - x1)) / 2 + 0.5;
    if (x2 >= x1) {
      x1 -= expand;
      x2 += expand;
    } else {
      x1 += expand;
      x2 -= expand;
    }
  }

  segments.push({
    id: `parent-h-${id}`,
    x1,
    y1: midY,
    x2,
    y2: midY,
    kind: "parent",
  });

  segments.push({
    id: `parent-v2-${id}`,
    x1: to.x,
    y1: midY,
    x2: to.x,
    y2: to.y,
    kind: "parent",
  });
}

function coupleRowAnchor(a: PedigreeNodeBox, b: PedigreeNodeBox) {
  const left = a.x <= b.x ? a : b;
  const right = a.x <= b.x ? b : a;
  const x = (bottomCenter(left).x + bottomCenter(right).x) / 2;
  const y = Math.max(left.y + left.height, right.y + right.height);
  return { x, y };
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
    const left = a.x <= b.x ? a : b;
    const right = a.x <= b.x ? b : a;
    const p1 = rightMid(left);
    const p2 = leftMid(right);
    if (p2.x <= p1.x + 2) continue;
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
    const parent = byId.get(e.source);
    const child = byId.get(e.target);
    if (!parent || !child) continue;
    pushOrthogonalParentChild(segments, e.id, parent, child);
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

    let unionAnchor = bottomCenter(focalBox);
    if (spouseEdge) {
      const otherId =
        spouseEdge.source === focalId ? spouseEdge.target : spouseEdge.source;
      const otherBox = byId.get(otherId);
      if (otherBox) {
        unionAnchor = coupleRowAnchor(focalBox, otherBox);
      }
    }

    const childTargets = group
      .map((e) => byId.get(e.target))
      .filter((b): b is PedigreeNodeBox => !!b);
    if (childTargets.length === 0) continue;

    const childTops = childTargets.map((c) => topCenter(c));
    const firstChildY = Math.min(...childTops.map((p) => p.y));
    const railY = Math.min(
      firstChildY - PEDIGREE_STEM_CLEARANCE,
      unionAnchor.y +
        Math.max(
          PEDIGREE_STEM_CLEARANCE,
          (firstChildY - unionAnchor.y) * 0.45,
        ),
    );

    if (childTops.length === 1) {
      const top = childTops[0];
      if (Math.abs(unionAnchor.x - top.x) < 0.5) {
        segments.push({
          id: `union-drop-${unionId}-${childTargets[0].id}`,
          x1: unionAnchor.x,
          y1: unionAnchor.y,
          x2: top.x,
          y2: top.y,
          kind: "union-branch",
        });
      } else {
        segments.push({
          id: `union-stem-${unionId}`,
          x1: unionAnchor.x,
          y1: unionAnchor.y,
          x2: unionAnchor.x,
          y2: railY,
          kind: "union-stem",
        });
        segments.push({
          id: `union-rail-${unionId}-single`,
          x1: unionAnchor.x,
          y1: railY,
          x2: top.x,
          y2: railY,
          kind: "union-branch",
        });
        segments.push({
          id: `union-drop-${unionId}-${childTargets[0].id}`,
          x1: top.x,
          y1: railY,
          x2: top.x,
          y2: top.y,
          kind: "union-branch",
        });
      }
      continue;
    }

    segments.push({
      id: `union-stem-${unionId}`,
      x1: unionAnchor.x,
      y1: unionAnchor.y,
      x2: unionAnchor.x,
      y2: railY,
      kind: "union-stem",
    });

    const xs = childTops.map((p) => p.x);
    segments.push({
      id: `union-rail-${unionId}`,
      x1: Math.min(...xs),
      y1: railY,
      x2: Math.max(...xs),
      y2: railY,
      kind: "union-branch",
    });

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
