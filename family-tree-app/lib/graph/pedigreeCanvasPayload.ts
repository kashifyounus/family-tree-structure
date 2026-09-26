import { formatBilingualName } from "@/lib/format/displayName";
import type { FamilyGraph } from "@/lib/graph/types";
import {
  buildPedigreeConnectorSegments,
  type PedigreeGraphEdge,
  type PedigreeSegment,
} from "../../../shared/pedigreeConnectors";

/** Match web `PedigreeConnectorsLayer` box size (FamilySearch-style card footprint). */
export const PEDIGREE_CARD_W = 112;
export const PEDIGREE_CARD_H = 118;

export type PedigreeCanvasNode = {
  id: string;
  familyCode: string;
  label: string;
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
};

export type PedigreeMarriageBand = {
  x1: number;
  y: number;
  x2: number;
  label: string;
};

export type PedigreeCanvasPayload = {
  focalPersonId: string;
  nodes: PedigreeCanvasNode[];
  segments: PedigreeSegment[];
  marriageBand?: PedigreeMarriageBand | null;
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

export function buildPedigreeCanvasPayload(graph: FamilyGraph): PedigreeCanvasPayload {
  const nodes: PedigreeCanvasNode[] = graph.nodes.map((n) => {
    const p = n.data.person;
    const isPrivate = p.treeDisplayIsPrivate === true;
    return {
      id: n.id,
      familyCode: p.familyCode,
      label: formatBilingualName({
        firstName: p.firstName,
        lastName: p.lastName,
        urduFirstName: p.urduFirstName ?? null,
        urduLastName: p.urduLastName ?? null,
      }),
      initials: initialsFor(p.firstName, p.lastName, isPrivate),
      years: isPrivate
        ? ""
        : formatLifeYears(p.birthDate, p.deathDate, p.isLiving),
      gender: p.gender,
      x: n.position.x,
      y: n.position.y,
      w: PEDIGREE_CARD_W,
      h: PEDIGREE_CARD_H,
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

  let marriageBand: PedigreeMarriageBand | null = null;
  const partnerId = graph.focalPartnerIds?.[0];
  if (partnerId && graph.focalMarriageLabel) {
    const ego = nodes.find((n) => n.id === graph.focalPersonId);
    const partner = nodes.find((n) => n.id === partnerId);
    if (ego && partner && ego.y === partner.y) {
      const left = ego.x <= partner.x ? ego : partner;
      const right = ego.x <= partner.x ? partner : ego;
      marriageBand = {
        x1: left.x + left.w,
        y: left.y + left.h / 2,
        x2: right.x,
        label: graph.focalMarriageLabel,
      };
    }
  }

  return {
    focalPersonId: graph.focalPersonId,
    nodes,
    segments,
    marriageBand,
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
