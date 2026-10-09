import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import {
  computeRelationFinderResult,
  summarizeKinshipStepsForLocale,
} from "@/lib/kinship/relationPaths";

const roleCache = new Map<string, { en: string; ur: string }>();

function cacheKey(focalId: string, personId: string): string {
  return `${focalId}:${personId}`;
}

export type FocalRoleLabels = { en: string; ur: string };

/** Kinship role of `personId` relative to focal (English + Urdu script). */
export function roleLabelsFromFocal(
  focalId: string,
  personId: string,
): FocalRoleLabels {
  if (focalId === personId) {
    return { en: "You", ur: "آپ" };
  }
  const key = cacheKey(focalId, personId);
  const hit = roleCache.get(key);
  if (hit) return hit;

  let labels: FocalRoleLabels = { en: "Relative", ur: "رشتہ دار" };
  try {
    const result = computeRelationFinderResult(focalId, personId);
    if (result.ok && result.paths[0]) {
      const { peopleById } = loadKinshipDataset();
      const steps = result.paths[0];
      labels = {
        en: summarizeKinshipStepsForLocale(steps, peopleById, "en"),
        ur: summarizeKinshipStepsForLocale(steps, peopleById, "ur"),
      };
    } else if (result.summaries[0]) {
      labels = { en: result.summaries[0], ur: "رشتہ دار" };
    }
  } catch {
    labels = { en: "Relative", ur: "رشتہ دار" };
  }
  roleCache.set(key, labels);
  return labels;
}

/** @deprecated Use roleLabelsFromFocal */
export function roleLabelFromFocal(focalId: string, personId: string): string {
  return roleLabelsFromFocal(focalId, personId).en;
}

export function clearRoleLabelCache(): void {
  roleCache.clear();
}
