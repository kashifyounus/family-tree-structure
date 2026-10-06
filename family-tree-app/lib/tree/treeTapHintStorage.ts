import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@mughals/tree-tap-hint-dismissed/v1";

export async function loadTreeTapHintDismissed(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function dismissTreeTapHint(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
}
