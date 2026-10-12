import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_MIN_L_JOG,
} from "../pedigreeLayoutTokens";

const ROW_Y_EPS = 3;

function cardWidthForRow(rowY: number, marriageRowY: number): number {
  return Math.abs(rowY - marriageRowY) < ROW_Y_EPS
    ? PEDIGREE_CARD_BIG_W
    : PEDIGREE_CARD_SMALL_W;
}

/**
 * Push overlapping cards apart on each horizontal row (same y).
 * Keeps generation y unchanged; fixes collateral / sibling expansion glitches.
 */
export function deoverlapPedigreeRowPositions(
  positions: Map<string, { x: number; y: number }>,
  included: ReadonlySet<string>,
  marriageRowY: number,
): void {
  const byRow = new Map<number, string[]>();
  for (const [id, pos] of positions) {
    if (!included.has(id)) continue;
    const rowKey = Math.round(pos.y / ROW_Y_EPS) * ROW_Y_EPS;
    const list = byRow.get(rowKey) ?? [];
    list.push(id);
    byRow.set(rowKey, list);
  }

  for (const [rowY, ids] of byRow) {
    // Descendant rows use union rails — only deoverlap marriage row and ancestors.
    if (rowY > marriageRowY + ROW_Y_EPS) continue;
    const cardW = cardWidthForRow(rowY, marriageRowY);
    const minStep = cardW + PEDIGREE_MIN_L_JOG;
    const sorted = [...ids].sort((a, b) => {
      const ax = positions.get(a)?.x ?? 0;
      const bx = positions.get(b)?.x ?? 0;
      return ax - bx;
    });
    for (let i = 1; i < sorted.length; i++) {
      const prevId = sorted[i - 1];
      const currId = sorted[i];
      const prev = positions.get(prevId);
      const curr = positions.get(currId);
      if (!prev || !curr) continue;
      const minX = prev.x + minStep;
      if (curr.x < minX) {
        positions.set(currId, { x: minX, y: curr.y });
      }
    }
  }
}
