import type { FamilyGraph } from "@/lib/graph/types";
import { PEDIGREE_ROW_STEP } from "../../../shared/pedigreeLayoutTokens";
import type { PedigreeSegment } from "../../../shared/pedigreeConnectors";
import type { PedigreeCanvasNode } from "@/lib/graph/pedigreeCanvasPayload";

const GHOST_W = 76;
const GHOST_H = 44;

export type GhostPlaceholderCopy = {
  parentsEn: string;
  parentsUr: string;
  siblingsEn: string;
  siblingsUr: string;
  marriageEn: string;
  marriageUr: string;
};

export function appendGhostBranchPlaceholders(
  graph: FamilyGraph,
  nodes: PedigreeCanvasNode[],
  segments: PedigreeSegment[],
  copy: GhostPlaceholderCopy,
): void {
  const rowY = nodes.find((n) => n.id === graph.focalPersonId)?.y ?? 0;
  const marriageRowNodes = nodes.filter((n) => Math.abs(n.y - rowY) < 3);

  for (const n of [...nodes]) {
    if (n.isGhost) continue;
    if (n.hasUnexpandedParents) {
      const gx = n.x + (n.w - GHOST_W) / 2;
      const gy = n.y - PEDIGREE_ROW_STEP + 12;
      nodes.push(makeGhostNode({
        id: `ghost-parents-${n.id}`,
        x: gx,
        y: gy,
        roleEn: copy.parentsEn,
        roleUr: copy.parentsUr,
        anchorId: n.id,
        ghostKind: "parents",
      }));
      segments.push(ghostStem(n.x + n.w / 2, n.y, gx + GHOST_W / 2, gy + GHOST_H, `ghost-up-${n.id}`));
    }
    if (n.hasUnexpandedSiblings && Math.abs(n.y - rowY) < 3) {
      const gx = n.x - GHOST_W - 16;
      const gy = n.y + (n.h - GHOST_H) / 2;
      nodes.push(makeGhostNode({
        id: `ghost-siblings-${n.id}`,
        x: gx,
        y: gy,
        roleEn: copy.siblingsEn,
        roleUr: copy.siblingsUr,
        anchorId: n.id,
        ghostKind: "siblings",
      }));
      segments.push(ghostStem(gx + GHOST_W, gy + GHOST_H / 2, n.x, n.y + n.h / 2, `ghost-sib-${n.id}`));
    }
  }

  const partners = graph.focalPartnerIds ?? [];
  const ego = nodes.find((n) => n.id === graph.focalPersonId && !n.isGhost);
  if (ego && partners.length > 1) {
    const visiblePartners = new Set(
      marriageRowNodes.filter((n) => partners.includes(n.id)).map((n) => n.id),
    );
    let ghostX = ego.x + ego.w + 24;
    for (let i = 0; i < partners.length; i++) {
      const partnerId = partners[i];
      if (visiblePartners.has(partnerId)) continue;
      const partnerNode = nodes.find((n) => n.id === partnerId && !n.isGhost);
      if (partnerNode && Math.abs(partnerNode.y - rowY) < 3) continue;
      nodes.push(makeGhostNode({
        id: `ghost-marriage-${partnerId}`,
        x: ghostX,
        y: ego.y + (ego.h - GHOST_H) / 2,
        roleEn: copy.marriageEn,
        roleUr: copy.marriageUr,
        anchorId: ego.id,
        isMarriageGhost: true,
        ghostKind: "marriage",
      }));
      segments.push({
        id: `ghost-marriage-seg-${partnerId}`,
        x1: ego.x + ego.w,
        y1: ego.y + ego.h / 2,
        x2: ghostX,
        y2: ego.y + ego.h / 2,
        kind: "spouse",
        color: "#B83C3C",
        strokeWidth: 3,
        dashed: true,
      });
      ghostX += GHOST_W + 20;
    }
  }
}

export type GhostBranchKind = "parents" | "siblings" | "marriage";

function makeGhostNode(input: {
  id: string;
  x: number;
  y: number;
  roleEn: string;
  roleUr: string;
  anchorId: string;
  isMarriageGhost?: boolean;
  ghostKind: GhostBranchKind;
}): PedigreeCanvasNode {
  return {
    id: input.id,
    familyCode: "",
    label: "…",
    nameLine1: "…",
    nameLine2: "",
    initials: "…",
    years: "",
    gender: "OTHER",
    x: input.x,
    y: input.y,
    w: GHOST_W,
    h: GHOST_H,
    isFocal: false,
    isDeceased: false,
    isPrivate: false,
    hasUnexpandedParents: false,
    hasUnexpandedChildren: false,
    nickname: null,
    tier: "small",
    visualBand: input.isMarriageGhost ? "spouse" : "ggp",
    bandColor: input.isMarriageGhost ? "#B83C3C88" : "#E6B42866",
    roleLineEn: input.roleEn,
    roleLineUr: input.roleUr,
    isGhost: true,
    ghostAnchorId: input.anchorId,
    ghostKind: input.ghostKind,
  };
}

function ghostStem(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  id: string,
): PedigreeSegment {
  return {
    id,
    x1,
    y1,
    x2,
    y2,
    kind: "parent",
    color: "#9ca3af",
    strokeWidth: 2,
    dashed: true,
  };
}
