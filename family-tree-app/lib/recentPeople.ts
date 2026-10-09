import AsyncStorage from "@react-native-async-storage/async-storage";

import { getActiveArchiveLane } from "@/lib/db/archiveLane";
import { readWithLegacyKey } from "@/lib/storage/legacyAsyncStorage";

const MAX = 8;
const RECENT_PREFIX = "@kuriosity/recent-people/v1";
const RECENT_PREFIX_LEGACY = "@mughals/recent-people/v1";

export type RecentPerson = {
  personId: string;
  familyCode: string;
  displayName: string;
  visitedAt: number;
};

function storageKey(): string {
  return `${RECENT_PREFIX}/${getActiveArchiveLane()}`;
}

function legacyStorageKey(): string {
  return `${RECENT_PREFIX_LEGACY}/${getActiveArchiveLane()}`;
}

export async function loadRecentPeople(): Promise<RecentPerson[]> {
  try {
    const raw = await readWithLegacyKey(storageKey(), legacyStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentPerson[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordRecentVisit(entry: Omit<RecentPerson, "visitedAt">) {
  const list = await loadRecentPeople();
  const filtered = list.filter((p) => p.personId !== entry.personId);
  const next: RecentPerson[] = [
    { ...entry, visitedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX);
  await AsyncStorage.setItem(storageKey(), JSON.stringify(next));
}
