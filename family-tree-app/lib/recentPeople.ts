import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@mughals/recent-people/v1";
const MAX = 8;

export type RecentPerson = {
  personId: string;
  familyCode: string;
  displayName: string;
  visitedAt: number;
};

export async function loadRecentPeople(): Promise<RecentPerson[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
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
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
