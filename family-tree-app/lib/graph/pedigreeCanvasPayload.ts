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
import { formatBilingualName } from "@/lib/format/displayName";
import {
  roleLabelsFromFocal,
  clearRoleLabelCache,
} from "@/lib/kinship/roleLabelFromFocal";
import { computeRelationFinderResult } from "@/lib/kinship/relationPaths";
import {
  generationOffsetFromFocal,
  resolvePedigreeVisualBand,
} from "../../../shared/genealogy/pedigreeNodePresentation";
import {
  PEDIGREE_BAND_COLORS,
  PEDIGREE_BAND_LABELS,
  type PedigreeVisualBand,
} from "../../../shared/pedigreeBandTheme";
import {
  formatPersonDisplayName,
  isUnknownCoParentFamilyCode,
  UNKNOWN_COPARENT_DISPLAY,
} from "../../../shared/unknownCoParent";
import { appendGhostBranchPlaceholders } from "@/lib/graph/ghostBranchPlaceholders";
import { copy } from "@/content/businessCopy";

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
  /** Mother’s-side wing (spouse line) — distinct card accent */
  maternalWing?: boolean;
  visualBand?: PedigreeVisualBand;
  bandColor?: string;
  roleLineEn?: string;
  roleLineUr?: string;
  isSpouseCard?: boolean;
  isSharedAncestor?: boolean;
  isGhost?: boolean;
  ghostAnchorId?: string;
  ghostKind?: "parents" | "siblings" | "marriage";
};

const PEDIGREE_CARD_DETAIL_SMALL_H = 92;
const PEDIGREE_CARD_DETAIL_BIG_H = 102;

function maternalWingPersonIds(graph: FamilyGraph): Set<string> {
  const ids = new Set<string>();
  for (const partnerId of graph.focalPartnerIds ?? []) {
    ids.add(partnerId);
    for (const edge of graph.edges) {
      if (edge.type === "parent" && edge.target === partnerId) {
        ids.add(edge.source);
      }
      if (
        edge.type === "sibling" &&
        (edge.source === partnerId || edge.target === partnerId)
      ) {
        ids.add(edge.source);
        ids.add(edge.target);
      }
    }
  }
  return ids;
}

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

export type CousinOverlayPayload = {
  message: string;
  pathPersonIds: string[];
};

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
  cousinOverlay?: CousinOverlayPayload | null;
  marriageLabelEn?: string;
  marriageLabelUr?: string;
  uiVariant?: "cousin-network";
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
  clearRoleLabelCache();
  const partnerIds = new Set(graph.focalPartnerIds ?? []);
  const sharedAncestorSet = new Set(graph.sharedAncestorIds ?? []);
  const maternalIds = maternalWingPersonIds(graph);
  const layoutEdges = graph.edges.map((e) => ({
    source: e.source,
    target: e.target,
    type: e.type,
  }));
  const useDetailCards = graph.nodes.length <= 160;
  const nodes: PedigreeCanvasNode[] = graph.nodes.map((n) => {
    const p = n.data.person;
    const isPrivate = p.treeDisplayIsPrivate === true;
    const isUnknownCoParent = isUnknownCoParentFamilyCode(p.familyCode);
    const highlightSet = new Set(options.highlightPersonIds ?? []);
    const isBig =
      n.id === graph.focalPersonId ||
      partnerIds.has(n.id) ||
      highlightSet.has(n.id);
    const displayName = formatPersonDisplayName({
      firstName: p.firstName,
      lastName: p.lastName,
      familyCode: p.familyCode,
    });
    const urduLine = [p.urduFirstName, p.urduLastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const englishLine = `${p.firstName} ${p.lastName}`.trim();
    const nameLine1 = isPrivate
      ? p.firstName
      : isUnknownCoParent
        ? UNKNOWN_COPARENT_DISPLAY.firstName
        : urduLine
          ? englishLine
          : p.firstName.trim();
    const nameLine2 = isPrivate
      ? ""
      : isUnknownCoParent
        ? UNKNOWN_COPARENT_DISPLAY.lastName
        : urduLine
          ? urduLine
          : p.lastName.trim();
    const isSpouseCard = partnerIds.has(n.id);
    const genOffset = generationOffsetFromFocal(
      graph.focalPersonId,
      n.id,
      layoutEdges,
    );
    let visualBand = resolvePedigreeVisualBand({
      focalId: graph.focalPersonId,
      personId: n.id,
      isSpouse: isSpouseCard,
      isMaternalWing: maternalIds.has(n.id),
      generationOffset: genOffset,
    });
    if (sharedAncestorSet.has(n.id)) {
      visualBand = "ggp";
    }
    const bandColor = PEDIGREE_BAND_COLORS[visualBand];
    const bandLabels = PEDIGREE_BAND_LABELS[visualBand];
    const roleLabels =
      useDetailCards && !isPrivate && !isUnknownCoParent
        ? n.id === graph.focalPersonId
          ? { en: bandLabels.en, ur: bandLabels.ur }
          : roleLabelsFromFocal(graph.focalPersonId, n.id)
        : { en: "", ur: "" };
    const roleLineEn = roleLabels.en;
    const roleLineUr = roleLabels.ur || bandLabels.ur;
    const detail = useDetailCards && (roleLineEn || roleLineUr);
    return {
      id: n.id,
      familyCode: p.familyCode,
      label: isPrivate
        ? p.firstName
        : isUnknownCoParent
          ? displayName
          : formatBilingualName(p) || displayName,
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
      h: detail
        ? isBig
          ? PEDIGREE_CARD_DETAIL_BIG_H
          : PEDIGREE_CARD_DETAIL_SMALL_H
        : isBig
          ? PEDIGREE_CARD_BIG_H
          : PEDIGREE_CARD_SMALL_H,
      tier: isBig ? "big" : "small",
      isFocal: Boolean(n.data.isFocal) || n.id === graph.focalPersonId,
      isDeceased: Boolean(n.data.isDeceased) || !p.isLiving,
      isPrivate,
      hasUnexpandedParents: Boolean(n.data.hasUnexpandedParents),
      hasUnexpandedChildren: Boolean(n.data.hasUnexpandedChildren),
      maternalWing: maternalIds.has(n.id) && n.id !== graph.focalPersonId,
      visualBand,
      bandColor,
      roleLineEn,
      roleLineUr,
      isSpouseCard,
      isSharedAncestor: sharedAncestorSet.has(n.id),
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

  let segments = buildPedigreeConnectorSegments(boxes, pedigreeEdges);
  if (graph.nodes.length <= 160) {
    appendGhostBranchPlaceholders(graph, nodes, segments, {
      parentsEn: copy.tree.ghostMoreAncestorsEn,
      parentsUr: copy.tree.ghostMoreAncestorsUr,
      siblingsEn: copy.tree.ghostMoreSiblingsEn,
      siblingsUr: copy.tree.ghostMoreSiblingsUr,
      marriageEn: copy.tree.ghostOtherMarriageEn,
      marriageUr: copy.tree.ghostOtherMarriageUr,
    });
  }
  segments = segments.map((s) =>
    s.kind === "spouse" ? { ...s, dashed: true } : s,
  );
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

  let cousinOverlay: CousinOverlayPayload | null = null;
  const primaryPartner = graph.focalPartnerIds?.[0];
  if (primaryPartner) {
    try {
      const rel = computeRelationFinderResult(
        graph.focalPersonId,
        primaryPartner,
      );
      const label = rel.summaries[0] ?? "";
      if (rel.ok && /cousin/i.test(label)) {
        const steps = rel.paths[0] ?? [];
        const pathPersonIds = [
          graph.focalPersonId,
          ...steps.map((s) => s.toId),
        ];
        cousinOverlay = { message: label, pathPersonIds };
      }
    } catch {
      cousinOverlay = null;
    }
  }

  return {
    focalPersonId: graph.focalPersonId,
    nodes,
    segments,
    highlightSegments:
      cousinOverlay && cousinOverlay.pathPersonIds.length >= 2
        ? buildPedigreePathHighlightSegments(
            boxes,
            cousinOverlay.pathPersonIds,
          )
        : highlightSegments,
    marriageBand,
    marriageBands,
    framingNodeIds: [...framingNodeIds],
    chevronOffset: PEDIGREE_CHEVRON_OFFSET,
    theme: defaultPedigreeCanvasTheme,
    highlightPersonIds,
    cousinOverlay,
    marriageLabelEn: "Married",
    marriageLabelUr: "شادی شدہ",
    uiVariant: "cousin-network",
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
