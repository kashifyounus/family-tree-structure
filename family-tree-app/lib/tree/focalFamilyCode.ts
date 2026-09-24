import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { loadRecentPeople } from "@/lib/recentPeople";

const CLOUD_FOCAL_KEY = "@mughals/cloud-focal-family-code/v1";

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
