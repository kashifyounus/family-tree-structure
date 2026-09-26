import {
  PEDIGREE_COLOR_PATH,
  PEDIGREE_PATH_STROKE,
} from "./pedigreeLayoutTokens";
import type { PedigreeNodeBox, PedigreeSegment } from "./pedigreeConnectors";

function center(box: PedigreeNodeBox) {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Purple overlay segments along an ordered kinship path (drawn on top of pedigree connectors).
 */
export function buildPedigreePathHighlightSegments(
  nodes: PedigreeNodeBox[],
  orderedPersonIds: string[],
): PedigreeSegment[] {
  if (orderedPersonIds.length < 2) return [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const segments: PedigreeSegment[] = [];

  for (let i = 0; i < orderedPersonIds.length - 1; i++) {
    const a = byId.get(orderedPersonIds[i]);
    const b = byId.get(orderedPersonIds[i + 1]);
    if (!a || !b) continue;
    const from = center(a);
    const to = center(b);
    const id = `path-${orderedPersonIds[i]}-${orderedPersonIds[i + 1]}`;
    if (Math.abs(from.x - to.x) < 0.5 || Math.abs(from.y - to.y) < 0.5) {
      segments.push({
        id,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        kind: "union-branch",
        color: PEDIGREE_COLOR_PATH,
        strokeWidth: PEDIGREE_PATH_STROKE,
      });
      continue;
    }
    const midY = (from.y + to.y) / 2;
    segments.push({
      id: `${id}-v1`,
      x1: from.x,
      y1: from.y,
      x2: from.x,
      y2: midY,
      kind: "union-branch",
      color: PEDIGREE_COLOR_PATH,
      strokeWidth: PEDIGREE_PATH_STROKE,
    });
    segments.push({
      id: `${id}-h`,
      x1: from.x,
      y1: midY,
      x2: to.x,
      y2: midY,
      kind: "union-branch",
      color: PEDIGREE_COLOR_PATH,
      strokeWidth: PEDIGREE_PATH_STROKE,
    });
    segments.push({
      id: `${id}-v2`,
      x1: to.x,
      y1: midY,
      x2: to.x,
      y2: to.y,
      kind: "union-branch",
      color: PEDIGREE_COLOR_PATH,
      strokeWidth: PEDIGREE_PATH_STROKE,
    });
  }

  return segments;
}
