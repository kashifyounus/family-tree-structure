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
    expect(await isOnboardingComplete("live")).toBe(false);
    await setOnboardingComplete("live");
    expect(await isOnboardingComplete("live")).toBe(true);
  });
});
