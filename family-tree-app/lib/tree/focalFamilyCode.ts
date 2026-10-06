import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import type { ArchiveLane } from "@/lib/db/archiveLane";
import { loadRecentPeople } from "@/lib/recentPeople";

const CLOUD_FOCAL_KEY = "@mughals/cloud-focal-family-code/v1";
const LOCAL_TREE_VIEW_PREFIX = "@mughals/local-tree-view-focal/v2";

function localTreeViewKey(lane: ArchiveLane): string {
  return `${LOCAL_TREE_VIEW_PREFIX}/${lane}`;
}

export async function loadCloudFocalFamilyCode(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(CLOUD_FOCAL_KEY);
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  } catch {
    return null;
  }
}

export async function saveCloudFocalFamilyCode(code: string): Promise<void> {
  const trimmed = code.trim();
  if (!trimmed) return;
  await AsyncStorage.setItem(CLOUD_FOCAL_KEY, trimmed);
}

/**
 * Default branch for family cloud tree when no deep link `familyCode` is provided.
 * Priority: last viewed on this device → household focal (private archive) → recent profile → demo default.
 */
export async function resolveCloudFocalFamilyCode(
  householdFocalCode?: string | null,
): Promise<string> {
  const stored = await loadCloudFocalFamilyCode();
  if (stored) return stored;

  const household = householdFocalCode?.trim();
  if (household) return household;

  const recent = await loadRecentPeople();
  const fromRecent = recent[0]?.familyCode?.trim();
  if (fromRecent) return fromRecent;

  return DEFAULT_FAMILY_CODE;
}

export function resolveLocalFocalFamilyCode(
  sessionFocalCode?: string | null,
): string {
  const focal = sessionFocalCode?.trim();
  return focal || DEFAULT_FAMILY_CODE;
}

/** Last tree view focal for a lane (not the registered “you” — who the graph is centered on). */
export async function loadLocalTreeViewFamilyCode(
  lane: ArchiveLane,
): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(localTreeViewKey(lane));
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  } catch {
    return null;
  }
}

export async function saveLocalTreeViewFamilyCode(
  lane: ArchiveLane,
  code: string,
): Promise<void> {
  const trimmed = code.trim();
  if (!trimmed) return;
  await AsyncStorage.setItem(localTreeViewKey(lane), trimmed);
}

/**
 * Default tree ego when no deep link: last viewed on this lane → registered member code.
 */
export async function resolveLocalTreeViewFamilyCode(
  lane: ArchiveLane,
  sessionFocalCode?: string | null,
): Promise<string> {
  const lastViewed = await loadLocalTreeViewFamilyCode(lane);
  if (lastViewed) return lastViewed;
  return resolveLocalFocalFamilyCode(sessionFocalCode);
}
