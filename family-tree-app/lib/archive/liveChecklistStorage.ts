import AsyncStorage from "@react-native-async-storage/async-storage";

const TREE_OPENED_KEY = "mughals_live_tree_checklist_opened";

export async function isLiveTreeChecklistOpened(): Promise<boolean> {
  return (await AsyncStorage.getItem(TREE_OPENED_KEY)) === "1";
}

export async function markLiveTreeChecklistOpened(): Promise<void> {
  await AsyncStorage.setItem(TREE_OPENED_KEY, "1");
}

export async function resetLiveTreeChecklistOpened(): Promise<void> {
  await AsyncStorage.removeItem(TREE_OPENED_KEY);
}
