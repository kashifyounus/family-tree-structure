import { useRouter, useSegments } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { AppState, StyleSheet, View } from "react-native";

import { GenealogyBootScreen } from "@/components/GenealogyBootScreen";
import { AppLockScreen } from "@/components/security/AppLockScreen";
import { AppPrivacyOverlay } from "@/components/security/AppPrivacyOverlay";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { isOnOnboardingRoute } from "@/lib/navigation/onboardingRoute";
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
  const onOnboarding = isOnOnboardingRoute(segments);

  useEffect(() => {
    if (!ready) return;
    log.lifecycle("Storage ready", { mode, onboardingComplete });
  }, [ready, mode, onboardingComplete]);

  useEffect(() => {
    if (!ready) return;
    if (!onboardingComplete && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (onboardingComplete && onOnboarding) {
      router.replace("/(tabs)");
    }
  }, [ready, onboardingComplete, onOnboarding, router]);

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

  if (!onboardingComplete && !onOnboarding) {
    return fallback ?? <GenealogyBootScreen message="Opening onboarding…" />;
  }

  return (
    <View style={styles.root} testID="navigation-gate-ready">
      {children}
      <AppPrivacyOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
