import type { PedigreeVisualBand } from "../pedigreeBandTheme";

export type PedigreeLayoutEdge = {
  source: string;
  target: string;
  type: string;
};

/**
 * Signed generation offset from focal: negative = ancestors, positive = descendants.
 */
export function generationOffsetFromFocal(
  focalId: string,
  personId: string,
  edges: readonly PedigreeLayoutEdge[],
): number | null {
  if (personId === focalId) return 0;

  const parentOf = new Map<string, Set<string>>();
  const childOf = new Map<string, Set<string>>();
  for (const e of edges) {
    if (e.type === "parent") {
      const kids = childOf.get(e.source) ?? new Set();
      kids.add(e.target);
      childOf.set(e.source, kids);
      const pars = parentOf.get(e.target) ?? new Set();
      pars.add(e.source);
      parentOf.set(e.target, pars);
    }
    if (e.type === "child") {
      const kids = childOf.get(e.source) ?? new Set();
      kids.add(e.target);
      childOf.set(e.source, kids);
      const pars = parentOf.get(e.target) ?? new Set();
      pars.add(e.source);
      parentOf.set(e.target, pars);
    }
  }

  const queue: { id: string; depth: number }[] = [{ id: focalId, depth: 0 }];
  const seen = new Set<string>([focalId]);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (id === personId) return depth;

    for (const p of parentOf.get(id) ?? []) {
      if (!seen.has(p)) {
        seen.add(p);
        queue.push({ id: p, depth: depth - 1 });
      }
    }
    for (const c of childOf.get(id) ?? []) {
      if (!seen.has(c)) {
        seen.add(c);
        queue.push({ id: c, depth: depth + 1 });
      }
    }
  }

  return null;
}

export function resolvePedigreeVisualBand(input: {
  focalId: string;
  personId: string;
  isSpouse: boolean;
  isMaternalWing: boolean;
  generationOffset: number | null;
}): PedigreeVisualBand {
  const { focalId, personId, isSpouse, isMaternalWing, generationOffset } =
    input;
  if (personId === focalId) return "focal";
  if (isSpouse) return "spouse";
  if (generationOffset === null) {
    return isMaternalWing ? "maternal" : "paternal";
  }
  if (generationOffset <= -3) return "ggp";
  if (generationOffset === -2) return "gp";
  if (generationOffset === -1) return isMaternalWing ? "maternal" : "gp";
  if (generationOffset >= 1) return "child";
  return isMaternalWing ? "maternal" : "paternal";
}
