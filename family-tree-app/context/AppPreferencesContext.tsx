import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
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

export type ThemePreference = "light" | "dark";
export type TextScalePreference = "normal" | "large";

type StoredPreferences = {
  theme: ThemePreference;
  textScale: TextScalePreference;
  hapticsEnabled: boolean;
};

type AppPreferencesContextValue = {
  ready: boolean;
  theme: ThemePreference;
  textScale: TextScalePreference;
  hapticsEnabled: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setTextScale: (scale: TextScalePreference) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  impactLight: () => void;
};

const defaults: StoredPreferences = {
  theme: "light",
  textScale: "normal",
  hapticsEnabled: true,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<StoredPreferences>(defaults);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setPrefs({ ...defaults, ...JSON.parse(raw) });
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
      setTheme,
      setTextScale,
      setHapticsEnabled,
      impactLight,
    }),
    [
      ready,
      prefs,
      setTheme,
      setTextScale,
      setHapticsEnabled,
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
