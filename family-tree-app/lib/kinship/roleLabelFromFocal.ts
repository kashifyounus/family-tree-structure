import { computeRelationFinderResult } from "@/lib/kinship/relationPaths";

const roleCache = new Map<string, string>();

function cacheKey(focalId: string, personId: string): string {
  return `${focalId}:${personId}`;
}

/** Kinship role of `personId` relative to focal (English label). */
export function roleLabelFromFocal(
  focalId: string,
  personId: string,
): string {
  if (focalId === personId) return "You";
  const key = cacheKey(focalId, personId);
  const hit = roleCache.get(key);
  if (hit) return hit;

  let label = "Relative";
  try {
    const result = computeRelationFinderResult(focalId, personId);
    label =
      result.ok && result.summaries[0]
        ? result.summaries[0]
        : result.message || "Relative";
  } catch {
    label = "Relative";
  }
  roleCache.set(key, label);
  return label;
}

export function clearRoleLabelCache(): void {
  roleCache.clear();
}
