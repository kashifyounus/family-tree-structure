import type { FamilyGraph } from "@/lib/graph/types";
import {
  buildPedigreeConnectorSegments,
  type PedigreeGraphEdge,
  type PedigreeSegment,
} from "../../../shared/pedigreeConnectors";
import {
  PEDIGREE_CARD_BIG_H,
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_H,
  PEDIGREE_CARD_SMALL_H,
  PEDIGREE_CARD_SMALL_W,
  PEDIGREE_CARD_W,
  PEDIGREE_CHEVRON_OFFSET,
} from "../../../shared/pedigreeLayoutTokens";
import { buildPedigreePathHighlightSegments } from "../../../shared/pedigreePathHighlight";
import { kuriosityPedigreeTheme } from "../../../shared/pedigreeTheme";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";
import {
  formatPersonDisplayName,
  isUnknownCoParentFamilyCode,
  UNKNOWN_COPARENT_DISPLAY,
} from "../../../shared/unknownCoParent";

export {
  PEDIGREE_CARD_W,
  PEDIGREE_CARD_H,
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_CARD_BIG_H,
} from "../../../shared/pedigreeLayoutTokens";

export type PedigreeCanvasNode = {
  id: string;
  familyCode: string;
  label: string;
  nameLine1: string;
  nameLine2: string;
  initials: string;
  years: string;
  gender: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isFocal: boolean;
  isDeceased: boolean;
  isPrivate: boolean;
  hasUnexpandedParents: boolean;
  hasUnexpandedChildren: boolean;
  nickname: string | null;
  tier: "big" | "small";
};

export type PedigreeMarriageBand = {
  x1: number;
  y: number;
  x2: number;
  label: string;
};

export type PedigreeCanvasTheme = {
  canvas: string;
  connector: string;
  primary: string;
  surface: string;
};

export type PedigreeCanvasPayloadOptions = {
  pathHighlightPersonIds?: string[];
  highlightPersonIds?: string[];
};

function marriageBandBetween(
  a: PedigreeCanvasNode,
  b: PedigreeCanvasNode,
  label: string,
): PedigreeMarriageBand | null {
  if (a.y !== b.y) return null;
  const left = a.x <= b.x ? a : b;
  const right = a.x <= b.x ? b : a;
  if (right.x <= left.x + left.w + 4) return null;
  return {
    x1: left.x + left.w,
    y: left.y + left.h / 2,
    x2: right.x,
    label,
  };
}

/** Marriage-row band: adjacent pair only (avoids drawing across intervening spouse cards). */
export function marriageBandForPartnerOnRow(
  ego: PedigreeCanvasNode,
  partner: PedigreeCanvasNode,
  label: string,
  rowPeers: PedigreeCanvasNode[],
): PedigreeMarriageBand | null {
  const byX = [...rowPeers].sort((a, b) => a.x - b.x);
  const egoIdx = byX.findIndex((n) => n.id === ego.id);
  const partnerIdx = byX.findIndex((n) => n.id === partner.id);
  if (egoIdx < 0 || partnerIdx < 0) {
    return marriageBandBetween(ego, partner, label);
  }
  if (Math.abs(egoIdx - partnerIdx) === 1) {
    return marriageBandBetween(ego, partner, label);
  }
  const leftIdx = Math.min(egoIdx, partnerIdx);
  const rightIdx = Math.max(egoIdx, partnerIdx);
  const leftNode = byX[rightIdx - 1];
  const rightNode = byX[rightIdx];
  if (!leftNode || !rightNode) {
    return marriageBandBetween(ego, partner, label);
  }
  return marriageBandBetween(leftNode, rightNode, label);
}

export type PedigreeCanvasPayload = {
  focalPersonId: string;
  nodes: PedigreeCanvasNode[];
  segments: PedigreeSegment[];
  highlightSegments?: PedigreeSegment[];
  marriageBand?: PedigreeMarriageBand | null;
  marriageBands?: PedigreeMarriageBand[];
  framingNodeIds?: string[];
  chevronOffset: number;
  theme: PedigreeCanvasTheme;
  highlightPersonIds?: string[];
};

export const defaultPedigreeCanvasTheme: PedigreeCanvasTheme = {
  canvas: kuriosityDesign.brand.pedigreeCanvas,
  connector: kuriosityDesign.pedigree.connector,
  primary: kuriosityDesign.brand.primary,
  surface: kuriosityPedigreeTheme.cardSurface,
};

function yearFrom(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const y = iso.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

function formatLifeYears(
  birthDate: string | null,
  deathDate: string | null,
  isLiving: boolean,
): string {
  const b = yearFrom(birthDate);
  const d = yearFrom(deathDate);
  if (b && d) return `${b}–${d}`;
  if (b && !isLiving) return `${b}–`;
  if (b) return `${b}–`;
  if (d) return `–${d}`;
  return "";
}

function initialsFor(
  first: string,
  last: string,
  isPrivate: boolean,
): string {
  if (isPrivate) return "?";
  const a = first.trim()[0] ?? "";
  const b = last.trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function buildPedigreeCanvasPayload(
  graph: FamilyGraph,
  options: PedigreeCanvasPayloadOptions = {},
): PedigreeCanvasPayload {
  const partnerIds = new Set(graph.focalPartnerIds ?? []);
  const nodes: PedigreeCanvasNode[] = graph.nodes.map((n) => {
    const p = n.data.person;
    const isPrivate = p.treeDisplayIsPrivate === true;
    const isUnknownCoParent = isUnknownCoParentFamilyCode(p.familyCode);
    const isBig = n.id === graph.focalPersonId || partnerIds.has(n.id);
    const displayName = formatPersonDisplayName({
      firstName: p.firstName,
      lastName: p.lastName,
      familyCode: p.familyCode,
    });
    const nameLine1 = isPrivate
      ? p.firstName
      : isUnknownCoParent
        ? UNKNOWN_COPARENT_DISPLAY.firstName
        : p.firstName.trim();
    const nameLine2 = isPrivate
      ? ""
      : isUnknownCoParent
        ? UNKNOWN_COPARENT_DISPLAY.lastName
        : p.lastName.trim();
    return {
      id: n.id,
      familyCode: p.familyCode,
      label: isPrivate ? p.firstName : displayName,
      nameLine1,
      nameLine2,
      initials: isUnknownCoParent
        ? "?"
        : initialsFor(p.firstName, p.lastName, isPrivate),
      years: isPrivate
        ? ""
        : formatLifeYears(p.birthDate, p.deathDate, p.isLiving),
      gender: p.gender,
      nickname: p.nickname ?? null,
      x: n.position.x,
      y: n.position.y,
      w: isBig ? PEDIGREE_CARD_BIG_W : PEDIGREE_CARD_SMALL_W,
      h: isBig ? PEDIGREE_CARD_BIG_H : PEDIGREE_CARD_SMALL_H,
      tier: isBig ? "big" : "small",
      isFocal: Boolean(n.data.isFocal) || n.id === graph.focalPersonId,
      isDeceased: Boolean(n.data.isDeceased) || !p.isLiving,
      isPrivate,
      hasUnexpandedParents: Boolean(n.data.hasUnexpandedParents),
      hasUnexpandedChildren: Boolean(n.data.hasUnexpandedChildren),
    };
  });

  const boxes = nodes.map((n) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    width: n.w,
    height: n.h,
  }));

  const pedigreeEdges: PedigreeGraphEdge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    label: e.label,
  }));

  const segments = buildPedigreeConnectorSegments(boxes, pedigreeEdges);
  const pathIds = options.pathHighlightPersonIds?.filter(Boolean) ?? [];
  const highlightSegments =
    pathIds.length >= 2
      ? buildPedigreePathHighlightSegments(boxes, pathIds)
      : [];
  const highlightPersonIds = options.highlightPersonIds?.filter(Boolean);

  const egoNode = nodes.find((n) => n.id === graph.focalPersonId);
  const marriageBands: PedigreeMarriageBand[] = [];
  const bandSpecs =
    graph.focalMarriageBands ??
    (graph.focalPartnerIds?.[0] && graph.focalMarriageLabel
      ? [
          {
            partnerId: graph.focalPartnerIds[0],
            label: graph.focalMarriageLabel,
          },
        ]
      : []);

  if (egoNode) {
    const rowPeers = nodes.filter(
      (n) =>
        n.id === egoNode.id ||
        (partnerIds.has(n.id) && Math.abs(n.y - egoNode.y) < 2),
    );
    for (const spec of bandSpecs) {
      const partner = nodes.find((n) => n.id === spec.partnerId);
      if (!partner) continue;
      const band = marriageBandForPartnerOnRow(
        egoNode,
        partner,
        spec.label,
        rowPeers,
      );
      if (band) marriageBands.push(band);
    }
  }

  const marriageBand = marriageBands[0] ?? null;

  const framingNodeIds = new Set<string>();
  if (pathIds.length >= 2) {
    framingNodeIds.add(graph.focalPersonId);
    for (const id of pathIds) framingNodeIds.add(id);
    for (const id of highlightPersonIds ?? []) framingNodeIds.add(id);
  } else {
    framingNodeIds.add(graph.focalPersonId);
    for (const id of graph.focalPartnerIds ?? []) framingNodeIds.add(id);
    for (const id of pathIds) framingNodeIds.add(id);
    for (const id of highlightPersonIds ?? []) framingNodeIds.add(id);
    for (const e of graph.edges) {
      if (e.type === "child" && e.source === graph.focalPersonId) {
        framingNodeIds.add(e.target);
      }
    }
    const focalNode = nodes.find((n) => n.id === graph.focalPersonId);
    if (focalNode) {
      for (const n of nodes) {
        if (n.y < focalNode.y - 1) {
          framingNodeIds.add(n.id);
        }
      }
    }
  }

  return {
    focalPersonId: graph.focalPersonId,
    nodes,
    segments,
    highlightSegments,
    marriageBand,
    marriageBands,
    framingNodeIds: [...framingNodeIds],
    chevronOffset: PEDIGREE_CHEVRON_OFFSET,
    theme: defaultPedigreeCanvasTheme,
    highlightPersonIds,
  };
}

/** @deprecated Use buildPedigreeCanvasPayload — kept for tests that assert tap routing fields. */
export function toCanvasPayload(graph: FamilyGraph) {
  const payload = buildPedigreeCanvasPayload(graph);
  return {
    focalPersonId: payload.focalPersonId,
    nodes: payload.nodes.map((n) => ({
      id: n.id,
      familyCode: n.familyCode,
      label: n.label,
      x: n.x,
      y: n.y,
    })),
    segments: payload.segments,
    edges: graph.edges.map((e) => ({ from: e.source, to: e.target, type: e.type })),
  };
}
