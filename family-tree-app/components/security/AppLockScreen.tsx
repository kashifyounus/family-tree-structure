import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";

type AppLockScreenProps = {
  onUnlocked: () => void;
};

export function AppLockScreen({ onUnlocked }: AppLockScreenProps) {
  const theme = useAppTheme();
  const prefs = useAppPreferences();
  const { showError } = useAppFeedback();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinError, setPinError] = useState<string | undefined>();

  const unlockSuccess = () => {
    prefs.unlock();
    onUnlocked();
    setPin("");
    setPinError(undefined);
  };

  const tryBiometric = async () => {
    setBusy(true);
    try {
      const ok = await prefs.tryBiometricUnlock();
      if (ok) {
        unlockSuccess();
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!prefs.biometricUnlockEnabled) return;
    void (async () => {
      setBusy(true);
      try {
        const ok = await prefs.tryBiometricUnlock();
        if (ok) unlockSuccess();
      } finally {
        setBusy(false);
      }
    })();
  }, [prefs.biometricUnlockEnabled, prefs.tryBiometricUnlock]);

  const submit = async () => {
    setBusy(true);
    try {
      const ok = await prefs.verifyPin(pin);
      if (!ok) {
        setPinError(copy.security.wrongPin);
        showError(new Error(copy.security.wrongPin));
        return;
      }
      unlockSuccess();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <AppText variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
        {copy.security.unlockTitle}
      </AppText>
      <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
        {copy.security.unlockBody}
      </AppText>
      <FormTextInput
        label={copy.security.pinLabel}
        value={pin}
        onChangeText={(value) => {
          setPin(value);
          setPinError(undefined);
        }}
        errorText={pinError}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
        style={{ marginTop: 24 }}
      />
      <Button disabled={busy} onPress={() => void submit()} style={{ marginTop: 16 }}>
        {busy ? <ButtonSpinner /> : null}
        <ButtonText>{copy.security.unlockButton}</ButtonText>
      </Button>
      {prefs.biometricUnlockEnabled ? (
        <Button variant="outline" onPress={() => void tryBiometric()} style={{ marginTop: 12 }}>
          <ButtonText>{copy.security.biometricUnlock}</ButtonText>
        </Button>
      ) : null}
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
