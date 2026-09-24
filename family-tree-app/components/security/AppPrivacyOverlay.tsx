import { useEffect, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";

import { useAppPreferences } from "@/context/AppPreferencesContext";
import { copy } from "@/content/businessCopy";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

/** Hides tree content in the app switcher when a PIN is enabled. */
export function AppPrivacyOverlay() {
  const theme = useAppTheme();
  const prefs = useAppPreferences();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!prefs.pinEnabled) {
      setHidden(false);
      return;
    }
    const sub = AppState.addEventListener("change", (state) => {
      setHidden(state !== "active");
    });
    return () => sub.remove();
  }, [prefs.pinEnabled]);

  if (!prefs.pinEnabled || !hidden) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <AppText variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {copy.security.privacyShield}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
});
