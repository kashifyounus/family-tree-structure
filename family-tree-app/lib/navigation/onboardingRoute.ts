/** True when Expo Router is showing the onboarding stack (Maestro waits on `onboarding-screen`). */
export function isOnOnboardingRoute(segments: readonly string[]): boolean {
  return segments.length > 0 && segments[0] === "onboarding";
}
