import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AppState, View } from "react-native";

import { AppLockScreen } from "@/components/security/AppLockScreen";
import { AppPrivacyOverlay } from "@/components/security/AppPrivacyOverlay";
import { LoadingView } from "@/components/ui/LoadingView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";

export function NavigationGate({ children }: { children: React.ReactNode }) {
  const { ready, onboardingComplete } = useStorage();
  const prefs = useAppPreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [ready, onboardingComplete, segments, router]);

  useEffect(() => {
    if (!prefs.pinEnabled) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        prefs.lock();
      }
    });
    return () => sub.remove();
  }, [prefs.pinEnabled, prefs.lock]);

  if (!ready || !prefs.ready) {
    return <LoadingView />;
  }

  if (prefs.pinEnabled && prefs.locked && onboardingComplete) {
    return <AppLockScreen onUnlocked={prefs.unlock} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <AppPrivacyOverlay />
    </View>
  );
}
