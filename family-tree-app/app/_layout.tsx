import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { NavigationGate } from "@/components/NavigationGate";
import { AppProviders } from "@/providers/AppProviders";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
      return;
    }
    const fallback = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 5000);
    return () => clearTimeout(fallback);
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProviders>
      <NavigationGate>
        <Stack screenOptions={{ animation: "slide_from_right" }}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="member/[personId]"
            options={{ title: "Person", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="marriage/[unionId]"
            options={{ title: "Marriage", headerBackTitle: "Back" }}
          />
        </Stack>
      </NavigationGate>
    </AppProviders>
  );
}
