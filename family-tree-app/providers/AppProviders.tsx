import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";

import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { LocalAccountProvider } from "@/context/LocalAccountContext";
import { StorageProvider } from "@/context/StorageContext";
import { darkTheme, lightTheme } from "@/theme/paperTheme";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider
        theme={theme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
