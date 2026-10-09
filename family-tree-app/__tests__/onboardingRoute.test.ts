import { isOnOnboardingRoute } from "@/lib/navigation/onboardingRoute";

describe("isOnOnboardingRoute", () => {
  it("matches onboarding segment", () => {
    expect(isOnOnboardingRoute(["onboarding"])).toBe(true);
    expect(isOnOnboardingRoute(["onboarding", "index"])).toBe(true);
  });

  it("rejects tabs and empty segments", () => {
    expect(isOnOnboardingRoute([])).toBe(false);
    expect(isOnOnboardingRoute(["(tabs)"])).toBe(false);
    expect(isOnOnboardingRoute(["(tabs)", "tree"])).toBe(false);
  });
});
