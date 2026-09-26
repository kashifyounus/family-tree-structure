import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";
import {
  humanKinshipLabelFromSteps,
  KINSHIP_LABEL_FALLBACK,
  type KinshipLabelStep,
} from "../../../shared/humanKinshipLabel";

export type KinshipStep = { fromId: string; toId: string; relation: string };

type AdjacencyEdge = { to: string; relation: string };

export function buildKinshipAdjacency(
  people: KinshipPerson[],
  unions: KinshipUnionRecord[],
): Map<string, AdjacencyEdge[]> {
  const adj = new Map<string, AdjacencyEdge[]>();
  const add = (from: string, to: string, relation: string) => {
    const list = adj.get(from) ?? [];
    list.push({ to, relation });
    adj.set(from, list);
  };

  for (const u of unions) {
    add(u.partner1Id, u.partner2Id, "spouse");
    add(u.partner2Id, u.partner1Id, "spouse");
    for (const cs of u.childships) {
      add(u.partner1Id, cs.childId, "parent");
      add(u.partner2Id, cs.childId, "parent");
      add(cs.childId, u.partner1Id, "child");
      add(cs.childId, u.partner2Id, "child");
    }
  }

  for (const p of people) {
    if (!adj.has(p.id)) adj.set(p.id, []);
  }
  return adj;
}

function stepsToLabelSteps(
  steps: KinshipStep[],
  peopleById: Map<string, KinshipPerson>,
): KinshipLabelStep[] {
  return steps.map((s) => {
    const to = peopleById.get(s.toId);
    return { relation: s.relation, toGender: to?.gender ?? null };
  });
}

export function summarizeKinshipSteps(
  steps: KinshipStep[],
  peopleById: Map<string, KinshipPerson>,
): string {
  const label = humanKinshipLabelFromSteps(stepsToLabelSteps(steps, peopleById));
  if (label) return label;
  if (steps.length > 0) return KINSHIP_LABEL_FALLBACK;
  return "Same person";
}

export type EnumeratePathsOptions = {
  maxPaths?: number;
  maxDepth?: number;
};

/**
 * Enumerate simple paths between two nodes (read-only kinship graph).
 * Stops after maxPaths (default 32) and sets truncated when the cap is hit.
 */
export function enumeratePathsOnGraph(
  adj: Map<string, AdjacencyEdge[]>,
  fromId: string,
  toId: string,
  options: EnumeratePathsOptions = {},
): { paths: KinshipStep[][]; truncated: boolean } {
  const maxPaths = options.maxPaths ?? 32;
  const maxDepth = options.maxDepth ?? 16;
  const paths: KinshipStep[][] = [];
  let truncated = false;

  if (fromId === toId) {
    return { paths: [[]], truncated: false };
  }

  const dfs = (currentId: string, targetId: string, visited: Set<string>, acc: KinshipStep[]) => {
    if (paths.length >= maxPaths) {
      truncated = true;
      return;
    }
    if (acc.length > maxDepth) return;
    if (currentId === targetId) {
      paths.push([...acc]);
      return;
    }
    const edges = adj.get(currentId) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      acc.push({ fromId: currentId, toId: edge.to, relation: edge.relation });
      dfs(edge.to, targetId, visited, acc);
      acc.pop();
      visited.delete(edge.to);
    }
  };

  dfs(fromId, toId, new Set([fromId]), []);
  return { paths, truncated };
}

export type RelationFinderResult = {
  ok: boolean;
  message: string;
  paths: KinshipStep[][];
  truncated: boolean;
  summaries: string[];
  nodeIdsOnPaths: string[];
  edgeKeysOnPaths: string[];
};

function edgeKey(step: KinshipStep): string {
  return `${step.fromId}|${step.relation}|${step.toId}`;
}

export function computeRelationFinderResult(
  fromPersonId: string,
  toPersonId: string,
  options?: EnumeratePathsOptions,
): RelationFinderResult {
  const { peopleById, allUnions } = loadKinshipDataset();
  const from = peopleById.get(fromPersonId);
  const to = peopleById.get(toPersonId);
  if (!from || !to) {
    return {
      ok: false,
      message: "We could not find both people in your private archive.",
      paths: [],
      truncated: false,
      summaries: [],
      nodeIdsOnPaths: [],
      edgeKeysOnPaths: [],
    };
  }
  if (from.id === to.id) {
    return {
      ok: true,
      message: "Same person",
      paths: [[]],
      truncated: false,
      summaries: ["Same person"],
      nodeIdsOnPaths: [from.id],
      edgeKeysOnPaths: [],
    };
  }

  const people = [...peopleById.values()];
  const adj = buildKinshipAdjacency(people, allUnions);
  const { paths, truncated } = enumeratePathsOnGraph(adj, from.id, to.id, options);

  if (paths.length === 0) {
    return {
      ok: false,
      message: "No relationship found in this archive.",
      paths: [],
      truncated: false,
      summaries: [],
      nodeIdsOnPaths: [],
      edgeKeysOnPaths: [],
    };
  }

  paths.sort((a, b) => a.length - b.length);
  const summaries = paths.map((p) => summarizeKinshipSteps(p, peopleById));
  const nodeSet = new Set<string>([from.id, to.id]);
  const edgeSet = new Set<string>();
  for (const path of paths) {
    for (const step of path) {
      nodeSet.add(step.fromId);
      nodeSet.add(step.toId);
      edgeSet.add(edgeKey(step));
    }
  }

  const countLabel = paths.length === 1 ? "1 path" : `${paths.length} paths`;
  const truncNote = truncated ? " (showing first paths — large family; more may exist)" : "";
  const message = `${summaries[0]} · ${countLabel}${truncNote}`;

  return {
    ok: true,
    message,
    paths,
    truncated,
    summaries,
    nodeIdsOnPaths: [...nodeSet],
    edgeKeysOnPaths: [...edgeSet],
  };
}
