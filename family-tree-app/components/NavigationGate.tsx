import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useStorage } from "@/context/StorageContext";

export function NavigationGate({ children }: { children: React.ReactNode }) {
  const { ready, onboardingComplete } = useStorage();
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

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
