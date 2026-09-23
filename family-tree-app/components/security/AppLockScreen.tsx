import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAppFeedback } from "@/context/ErrorContext";

type AppLockScreenProps = {
  onUnlocked: () => void;
};

export function AppLockScreen({ onUnlocked }: AppLockScreenProps) {
  const theme = useTheme();
  const prefs = useAppPreferences();
  const { showError } = useAppFeedback();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const ok = await prefs.verifyPin(pin);
      if (!ok) {
        showError(new Error(copy.security.wrongPin));
        return;
      }
      prefs.unlock();
      onUnlocked();
    } finally {
      setBusy(false);
      setPin("");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
        {copy.security.unlockTitle}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
        {copy.security.unlockBody}
      </Text>
      <FormTextInput
        label={copy.security.pinLabel}
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
        style={{ marginTop: 24 }}
      />
      <Button mode="contained" loading={busy} onPress={() => void submit()} style={{ marginTop: 16 }}>
        {copy.security.unlockButton}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});
