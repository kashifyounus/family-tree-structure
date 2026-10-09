import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getActiveArchiveLane,
  type ArchiveLane,
} from "@/lib/db/archiveLane";
import {
  readWithLegacyKey,
  removePrimaryAndLegacy,
} from "@/lib/storage/legacyAsyncStorage";

function completeKeys(lane: ArchiveLane): { primary: string; legacy: string } {
  if (lane === "demo") {
    return {
      primary: "kuriosity_onboarding_complete_demo",
      legacy: "mughals_onboarding_complete_demo",
    };
  }
  return {
    primary: "kuriosity_onboarding_complete_live",
    legacy: "mughals_onboarding_complete_live",
  };
}

export async function isOnboardingComplete(
  lane?: ArchiveLane,
): Promise<boolean> {
  const { primary, legacy } = completeKeys(lane ?? getActiveArchiveLane());
  const v = await readWithLegacyKey(primary, legacy);
  return v === "1";
}

export async function setOnboardingComplete(
  lane?: ArchiveLane,
): Promise<void> {
  const { primary } = completeKeys(lane ?? getActiveArchiveLane());
  await AsyncStorage.setItem(primary, "1");
}

export async function resetOnboardingForLane(
  lane: ArchiveLane,
): Promise<void> {
  const { primary, legacy } = completeKeys(lane);
  await removePrimaryAndLegacy(primary, legacy);
}

/** @deprecated use resetOnboardingForLane(getActiveArchiveLane()) */
export async function resetOnboardingForDev(): Promise<void> {
  await resetOnboardingForLane(getActiveArchiveLane());
}
