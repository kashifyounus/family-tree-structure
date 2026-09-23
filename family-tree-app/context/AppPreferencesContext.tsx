import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "@mughals/app-preferences/v1";
const PIN_HASH_KEY = "mughals_app_pin_hash";

export type ThemePreference = "light" | "dark";
export type TextScalePreference = "normal" | "large";

type StoredPreferences = {
  theme: ThemePreference;
  textScale: TextScalePreference;
  hapticsEnabled: boolean;
  pinEnabled: boolean;
  biometricUnlockEnabled: boolean;
};

type AppPreferencesContextValue = {
  ready: boolean;
  theme: ThemePreference;
  textScale: TextScalePreference;
  hapticsEnabled: boolean;
  pinEnabled: boolean;
  biometricUnlockEnabled: boolean;
  locked: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setTextScale: (scale: TextScalePreference) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  setBiometricUnlockEnabled: (enabled: boolean) => Promise<void>;
  tryBiometricUnlock: () => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  unlock: () => void;
  lock: () => void;
  impactLight: () => void;
};

const defaults: StoredPreferences = {
  theme: "light",
  textScale: "normal",
  hapticsEnabled: true,
  pinEnabled: false,
  biometricUnlockEnabled: false,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<StoredPreferences>(defaults);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const merged = raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
        setPrefs(merged);
        if (merged.pinEnabled) {
          setLocked(true);
        }
      } catch {
        /* keep defaults */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const patchPrefs = useCallback(async (patch: Partial<StoredPreferences>) => {
    let next = defaults;
    setPrefs((prev) => {
      next = { ...prev, ...patch };
      return next;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setTheme = useCallback(
    async (theme: ThemePreference) => {
      await patchPrefs({ theme });
    },
    [patchPrefs],
  );

  const setTextScale = useCallback(
    async (textScale: TextScalePreference) => {
      await patchPrefs({ textScale });
    },
    [patchPrefs],
  );

  const setHapticsEnabled = useCallback(
    async (hapticsEnabled: boolean) => {
      await patchPrefs({ hapticsEnabled });
    },
    [patchPrefs],
  );

  const setPin = useCallback(
    async (pin: string) => {
      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error("PIN must be 4–6 digits.");
      }
      const digest = await hashPin(pin);
      await SecureStore.setItemAsync(PIN_HASH_KEY, digest);
      await patchPrefs({ pinEnabled: true });
      setLocked(false);
    },
    [patchPrefs],
  );

  const clearPin = useCallback(async () => {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    await patchPrefs({ pinEnabled: false, biometricUnlockEnabled: false });
    setLocked(false);
  }, [patchPrefs]);

  const setBiometricUnlockEnabled = useCallback(
    async (biometricUnlockEnabled: boolean) => {
      await patchPrefs({ biometricUnlockEnabled });
    },
    [patchPrefs],
  );

  const tryBiometricUnlock = useCallback(async () => {
    if (!prefs.pinEnabled || !prefs.biometricUnlockEnabled) return false;
    try {
      const LocalAuthentication = await import("expo-local-authentication");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Mughal family records",
        cancelLabel: "Use PIN",
        disableDeviceFallback: true,
      });
      return result.success;
    } catch {
      return false;
    }
  }, [prefs.biometricUnlockEnabled, prefs.pinEnabled]);

  const verifyPin = useCallback(async (pin: string) => {
    const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
    if (!stored) return false;
    const digest = await hashPin(pin);
    return digest === stored;
  }, []);

  const unlock = useCallback(() => setLocked(false), []);
  const lock = useCallback(() => {
    if (prefs.pinEnabled) setLocked(true);
  }, [prefs.pinEnabled]);

  const impactLight = useCallback(() => {
    if (!prefs.hapticsEnabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [prefs.hapticsEnabled]);

  const value = useMemo(
    () => ({
      ready,
      theme: prefs.theme,
      textScale: prefs.textScale,
      hapticsEnabled: prefs.hapticsEnabled,
      pinEnabled: prefs.pinEnabled,
      biometricUnlockEnabled: prefs.biometricUnlockEnabled,
      locked,
      setTheme,
      setTextScale,
      setHapticsEnabled,
      setPin,
      clearPin,
      setBiometricUnlockEnabled,
      tryBiometricUnlock,
      verifyPin,
      unlock,
      lock,
      impactLight,
    }),
    [
      ready,
      prefs,
      locked,
      setTheme,
      setTextScale,
      setHapticsEnabled,
      setPin,
      clearPin,
      setBiometricUnlockEnabled,
      tryBiometricUnlock,
      verifyPin,
      unlock,
      lock,
      impactLight,
    ],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences(): AppPreferencesContextValue {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return ctx;
}
