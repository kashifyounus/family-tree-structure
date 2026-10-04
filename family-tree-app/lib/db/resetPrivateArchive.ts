import * as SecureStore from "expo-secure-store";

import {
  getActiveArchiveLane,
  localAccountSessionKey,
  setActiveArchiveLane,
  type ArchiveLane,
} from "@/lib/db/archiveLane";
import { getDatabaseForLane, resetLocalDatabase } from "@/lib/db/database";
import { resetOnboardingForLane } from "@/lib/onboarding/storage";

/** Wipes the active lane database (live or demo). */
export function resetArchiveDatabaseForLane(lane: ArchiveLane): void {
  setActiveArchiveLane(lane);
  resetLocalDatabase();
}

/** Wipes live archive SQLite + sign-out + onboarding for live lane. */
export async function resetPrivateArchiveAndSignOut(): Promise<void> {
  const lane: ArchiveLane = "live";
  setActiveArchiveLane(lane);
  resetLocalDatabase();
  await SecureStore.deleteItemAsync(localAccountSessionKey(lane));
  await resetOnboardingForLane(lane);
}

/** Clears demo archive completely so you can load sample again from onboarding. */
export async function resetDemoArchiveAndRestart(): Promise<void> {
  const lane: ArchiveLane = "demo";
  setActiveArchiveLane(lane);
  resetLocalDatabase();
  await SecureStore.deleteItemAsync(localAccountSessionKey(lane));
  await resetOnboardingForLane(lane);
}

export async function resetActiveArchiveAndSignOut(): Promise<void> {
  const lane = getActiveArchiveLane();
  setActiveArchiveLane(lane);
  resetLocalDatabase();
  await SecureStore.deleteItemAsync(localAccountSessionKey(lane));
  await resetOnboardingForLane(lane);
}
