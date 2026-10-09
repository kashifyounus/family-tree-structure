import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@kuriosity/primary-tree-union/v1";

/** personId → unionId */
let byPersonId: Record<string, string> = {};

export function getPrimaryTreeUnionId(personId: string): string | null {
  return byPersonId[personId] ?? null;
}

export async function loadPrimaryTreeUnionPrefs(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      byPersonId = {};
      return;
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    byPersonId =
      parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    byPersonId = {};
  }
}

export async function savePrimaryTreeUnion(
  personId: string,
  unionId: string,
): Promise<void> {
  byPersonId = { ...byPersonId, [personId]: unionId };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(byPersonId));
}

/** Test helper */
export function resetPrimaryTreeUnionPrefsForTests(): void {
  byPersonId = {};
}
