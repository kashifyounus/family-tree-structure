import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETE_KEY = "mughals_onboarding_complete";

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(COMPLETE_KEY);
  return v === "1";
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(COMPLETE_KEY, "1");
}

export async function resetOnboardingForDev(): Promise<void> {
  await AsyncStorage.removeItem(COMPLETE_KEY);
}
