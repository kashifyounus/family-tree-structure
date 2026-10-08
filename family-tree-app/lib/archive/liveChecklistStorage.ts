import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  readWithLegacyKey,
  removePrimaryAndLegacy,
} from "@/lib/storage/legacyAsyncStorage";

const TREE_OPENED_KEY = "kuriosity_live_tree_checklist_opened";
const TREE_OPENED_KEY_LEGACY = "mughals_live_tree_checklist_opened";

export async function isLiveTreeChecklistOpened(): Promise<boolean> {
  const value = await readWithLegacyKey(TREE_OPENED_KEY, TREE_OPENED_KEY_LEGACY);
  return value === "1";
}

export async function markLiveTreeChecklistOpened(): Promise<void> {
  await AsyncStorage.setItem(TREE_OPENED_KEY, "1");
}

export async function resetLiveTreeChecklistOpened(): Promise<void> {
  await removePrimaryAndLegacy(TREE_OPENED_KEY, TREE_OPENED_KEY_LEGACY);
}
