import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  isOnboardingComplete,
  setOnboardingComplete,
} from "@/lib/onboarding/storage";

describe("onboarding storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts incomplete and completes after flag", async () => {
    expect(await isOnboardingComplete()).toBe(false);
    await setOnboardingComplete();
    expect(await isOnboardingComplete()).toBe(true);
  });
});
