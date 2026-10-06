import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_COLUMN_STEP,
  PEDIGREE_ROW_STEP,
} from "../pedigreeLayoutTokens";

export type PathLayoutStep = {
  fromId: string;
  toId: string;
  relation: string;
};

export type PathTimelineEdge = {
  id: string;
  source: string;
  target: string;
  type: "spouse" | "parent" | "child" | "sibling";
};

/**
 * Vertical connection map: focal at the bottom band, ancestors above (smaller y).
 */
export function layoutKinshipPathTimeline(
  startPersonId: string,
  steps: readonly PathLayoutStep[],
  focalPersonId: string,
  endPersonId: string,
): {
  positions: Map<string, { x: number; y: number }>;
  edges: PathTimelineEdge[];
} {
  const positions = new Map<string, { x: number; y: number }>();
  const edges: PathTimelineEdge[] = [];
  const levels = new Map<string, number>();
  levels.set(startPersonId, 0);

  for (const step of steps) {
    const fromLevel = levels.get(step.fromId) ?? 0;
    let toLevel = fromLevel;
    if (step.relation === "parent") toLevel = fromLevel - 1;
    else if (step.relation === "child") toLevel = fromLevel + 1;
    else if (step.relation === "spouse") toLevel = fromLevel;
    levels.set(step.toId, toLevel);

    const edgeType =
      step.relation === "spouse"
        ? "spouse"
        : step.relation === "parent"
          ? "parent"
          : step.relation === "child"
            ? "child"
            : "sibling";
    edges.push({
      id: `path-${step.fromId}-${step.toId}`,
      source: step.fromId,
      target: step.toId,
      type: edgeType,
    });
  }

  const byLevel = new Map<number, string[]>();
  for (const id of new Set([startPersonId, ...steps.map((s) => s.toId)])) {
    const level = levels.get(id) ?? 0;
    const row = byLevel.get(level) ?? [];
    row.push(id);
    byLevel.set(level, row);
  }

  const minLevel = Math.min(...levels.values(), 0);
  const originX = 0;

  for (const [level, ids] of byLevel) {
    const y = (level - minLevel) * PEDIGREE_ROW_STEP;
    const rowWidth = (ids.length - 1) * PEDIGREE_COLUMN_STEP;
    const startX = originX - rowWidth / 2;
    ids.forEach((id, index) => {
      const isEndpoint = id === focalPersonId || id === endPersonId;
      const x =
        startX +
        index * PEDIGREE_COLUMN_STEP -
        (isEndpoint ? 0 : 0) +
        (isEndpoint ? PEDIGREE_CARD_BIG_W * 0.1 : 0);
      positions.set(id, { x, y });
    });
  }

  if (!positions.has(startPersonId)) {
    const level = levels.get(startPersonId) ?? 0;
    positions.set(startPersonId, {
      x: originX,
      y: (level - minLevel) * PEDIGREE_ROW_STEP,
    });
  }

  return { positions, edges };
}
