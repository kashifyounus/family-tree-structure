import type { PedigreeCanvasNode } from "@/lib/graph/pedigreeCanvasPayload";

export type LayoutBox = { x: number; y: number; w: number; h: number };

export function boxesOverlap(a: LayoutBox, b: LayoutBox): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function nodeBox(n: PedigreeCanvasNode): LayoutBox {
  return { x: n.x, y: n.y, w: n.w, h: n.h };
}

/**
 * Nudge ghost box until it does not overlap real cards (or attempts exhausted).
 */
export function resolveGhostBoxPosition(
  startX: number,
  startY: number,
  w: number,
  h: number,
  obstacles: readonly PedigreeCanvasNode[],
  kind: "parents" | "siblings" | "marriage",
): { x: number; y: number } {
  let x = startX;
  let y = startY;
  const box = (): LayoutBox => ({ x, y, w, h });

  const collides = () =>
    obstacles.some((n) => !n.isGhost && boxesOverlap(box(), nodeBox(n)));

  if (!collides()) return { x, y };

  for (let attempt = 0; attempt < 16; attempt++) {
    if (kind === "parents") {
      y -= 18;
      if (attempt % 3 === 1) x -= 14;
      if (attempt % 3 === 2) x += 14;
    } else if (kind === "siblings") {
      x -= 22;
      if (attempt % 4 === 2) y -= 12;
      if (attempt % 4 === 3) y += 12;
    } else {
      x += 18;
      if (attempt % 3 === 1) y -= 10;
    }
    if (!collides()) return { x, y };
  }

  return { x, y };
}
