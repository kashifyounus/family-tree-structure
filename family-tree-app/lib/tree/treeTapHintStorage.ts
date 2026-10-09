import AsyncStorage from "@react-native-async-storage/async-storage";

import { readWithLegacyKey } from "@/lib/storage/legacyAsyncStorage";

const KEY = "@kuriosity/tree-tap-hint-dismissed/v1";
const KEY_LEGACY = "@mughals/tree-tap-hint-dismissed/v1";

export async function loadTreeTapHintDismissed(): Promise<boolean> {
  try {
    const value = await readWithLegacyKey(KEY, KEY_LEGACY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function dismissTreeTapHint(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
}
