import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import "@/global.css";

import { GenealogyBootScreen } from "@/components/GenealogyBootScreen";
import { NavigationGate } from "@/components/NavigationGate";
import { APP_NAME, APP_VERSION_LABEL } from "@/constants/appMeta";
import { log } from "@/lib/logging/logger";
import { AppProviders } from "@/providers/AppProviders";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    log.lifecycle("Application starting", {
      app: APP_NAME,
      version: APP_VERSION_LABEL,
    });
    void SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <NavigationGate fallback={<GenealogyBootScreen message="Preparing your family archive…" />}>
        <Stack screenOptions={{ animation: "slide_from_right" }}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="member/[personId]"
            options={{ title: "Family member", headerBackTitle: "Members" }}
          />
          <Stack.Screen
            name="marriage/[unionId]"
            options={{ title: "Marriage record", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="design-gallery"
            options={{ title: "UI gallery", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="notifications"
            options={{ title: "Notifications", headerBackTitle: "Home" }}
          />
          <Stack.Screen
            name="find-relation"
            options={{ title: "Find relation", headerBackTitle: "Tree" }}
          />
          <Stack.Screen name="story/[storyId]" options={{ title: "Story" }} />
          <Stack.Screen
            name="add-member"
            options={{ title: "Add member", presentation: "transparentModal", headerShown: false }}
          />
          <Stack.Screen
            name="archive-settings"
            options={{ title: "Archive settings", headerBackTitle: "Account" }}
          />
        </Stack>
      </NavigationGate>
    </AppProviders>
  );
}
