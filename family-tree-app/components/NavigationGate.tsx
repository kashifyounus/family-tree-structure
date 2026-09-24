import { useRouter, useSegments } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { AppState, View } from "react-native";

import { GenealogyBootScreen } from "@/components/GenealogyBootScreen";
import { AppLockScreen } from "@/components/security/AppLockScreen";
import { AppPrivacyOverlay } from "@/components/security/AppPrivacyOverlay";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { log } from "@/lib/logging/logger";

type NavigationGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function NavigationGate({ children, fallback }: NavigationGateProps) {
  const { ready, onboardingComplete, mode } = useStorage();
  const prefs = useAppPreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    log.lifecycle("Storage ready", { mode, onboardingComplete });
  }, [ready, mode, onboardingComplete]);

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
    return fallback ?? <GenealogyBootScreen message="Loading family records…" />;
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
