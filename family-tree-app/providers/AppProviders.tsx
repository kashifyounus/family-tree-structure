import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { installGlobalErrorHandlers } from "@/lib/globalErrorHandlers";

import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { AppPreferencesProvider, useAppPreferences } from "@/context/AppPreferencesContext";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { LocalAccountProvider } from "@/context/LocalAccountContext";
import { StorageProvider } from "@/context/StorageContext";
import { darkTheme, lightTheme } from "@/theme/paperTheme";

type AppProvidersProps = {
  children: React.ReactNode;
};

function ThemedApp({ children }: AppProvidersProps) {
  const prefs = useAppPreferences();
  const theme = prefs.theme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <StatusBar style={prefs.theme === "dark" ? "light" : "dark"} />
      <AppErrorBoundary>
        <ErrorProvider>
          <StorageProvider>
            <LocalAccountProvider>
              <AuthProvider>{children}</AuthProvider>
            </LocalAccountProvider>
          </StorageProvider>
        </ErrorProvider>
      </AppErrorBoundary>
    </PaperProvider>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppPreferencesProvider>
          <ThemedApp>{children}</ThemedApp>
        </AppPreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
