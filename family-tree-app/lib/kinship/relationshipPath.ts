import { computeRelationFinderResult } from "@/lib/kinship/relationPaths";

export function computeRelationSummary(
  fromPersonId: string,
  toPersonId: string,
): string {
  const result = computeRelationFinderResult(fromPersonId, toPersonId);
  if (!result.ok) return result.message;
  return result.summaries[0] ?? result.message;
}
