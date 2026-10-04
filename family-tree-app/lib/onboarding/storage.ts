import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getActiveArchiveLane,
  type ArchiveLane,
} from "@/lib/db/archiveLane";

function completeKey(lane: ArchiveLane): string {
  return lane === "demo"
    ? "mughals_onboarding_complete_demo"
    : "mughals_onboarding_complete_live";
}

export async function isOnboardingComplete(
  lane?: ArchiveLane,
): Promise<boolean> {
  const key = completeKey(lane ?? getActiveArchiveLane());
  const v = await AsyncStorage.getItem(key);
  return v === "1";
}

export async function setOnboardingComplete(
  lane?: ArchiveLane,
): Promise<void> {
  await AsyncStorage.setItem(completeKey(lane ?? getActiveArchiveLane()), "1");
}

export async function resetOnboardingForLane(
  lane: ArchiveLane,
): Promise<void> {
  await AsyncStorage.removeItem(completeKey(lane));
}

/** @deprecated use resetOnboardingForLane(getActiveArchiveLane()) */
export async function resetOnboardingForDev(): Promise<void> {
  await resetOnboardingForLane(getActiveArchiveLane());
}
