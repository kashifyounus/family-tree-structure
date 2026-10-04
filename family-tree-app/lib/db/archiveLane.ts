import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppError } from "@/lib/errors/AppError";

export type ArchiveLane = "live" | "demo";

const LANE_KEY = "kuriosity_archive_lane";

let activeLane: ArchiveLane = "live";

export function getActiveArchiveLane(): ArchiveLane {
  return activeLane;
}

export function setActiveArchiveLane(lane: ArchiveLane): void {
  activeLane = lane;
}

export async function loadArchiveLane(): Promise<ArchiveLane> {
  const stored = await AsyncStorage.getItem(LANE_KEY);
  if (stored === "demo" || stored === "live") {
    activeLane = stored;
    return stored;
  }
  activeLane = "live";
  return "live";
}

export async function saveArchiveLane(lane: ArchiveLane): Promise<void> {
  activeLane = lane;
  await AsyncStorage.setItem(LANE_KEY, lane);
}

export function localAccountSessionKey(lane: ArchiveLane = activeLane): string {
  return lane === "demo"
    ? "mughals_local_account_id_demo"
    : "mughals_local_account_id_live";
}

export function assertDemoArchiveLane(): void {
  if (activeLane !== "demo") {
    throw new AppError(
      "VALIDATION",
      "Sample data can only be loaded in the demo archive. Switch to Demo in Account.",
    );
  }
}

export function assertLiveArchiveLane(): void {
  if (activeLane !== "live") {
    throw new AppError(
      "VALIDATION",
      "Personal records belong in your live archive. Switch to Live in Account.",
    );
  }
}
