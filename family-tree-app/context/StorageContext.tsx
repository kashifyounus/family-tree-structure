import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { StorageMode } from "@/lib/data/types";
import { getDatabase } from "@/lib/db/database";
import { countLocalMembers } from "@/lib/db/localRepository";
import {
  isOnboardingComplete,
  setOnboardingComplete,
} from "@/lib/onboarding/storage";
import {
  getApiBaseUrl,
  getAuthToken,
  loadApiUrlOverride,
  saveApiUrlOverride,
} from "@/lib/api";
import { AppError } from "@/lib/errors/AppError";
import { normalizeApiBaseUrl, validateApiBaseUrl } from "@/lib/apiUrl";
import { getLocalAccountCount } from "@/lib/localAccount/service";
import { log } from "@/lib/logging/logger";

const MODE_KEY = "mughals_storage_mode";

type StorageState = {
  ready: boolean;
  onboardingComplete: boolean;
  mode: StorageMode;
  apiUrl: string;
  localMemberCount: number;
  setMode: (mode: StorageMode) => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshLocalStats: () => void;
  dataRevision: number;
  bumpDataRevision: () => void;
};

const StorageContext = createContext<StorageState | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [mode, setModeState] = useState<StorageMode>("local");
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [localMemberCount, setLocalMemberCount] = useState(0);
  const [dataRevision, setDataRevision] = useState(0);

  useEffect(() => {
    void (async () => {
      getDatabase();
      const storedMode = await AsyncStorage.getItem(MODE_KEY);
      if (storedMode === "local" || storedMode === "online") {
        setModeState(storedMode);
      }
      const url = await loadApiUrlOverride();
      if (url) setApiUrlState(url);
      let onboardingDone = await isOnboardingComplete();
      const members = countLocalMembers();
      const token = await getAuthToken();
      if (!onboardingDone && (members > 0 || token || getLocalAccountCount() > 0)) {
        await setOnboardingComplete();
        onboardingDone = true;
      }
      setOnboardingCompleteState(onboardingDone);
      setLocalMemberCount(members);
      setReady(true);
      log.lifecycle("Local database opened", {
        members,
        mode: storedMode ?? "local",
        hasApiOverride: Boolean(url),
      });
    })();
  }, []);

  const refreshLocalStats = useCallback(() => {
    setLocalMemberCount(countLocalMembers());
  }, []);

  const bumpDataRevision = useCallback(() => {
    setDataRevision((n) => n + 1);
    refreshLocalStats();
  }, [refreshLocalStats]);

  const setMode = useCallback(async (next: StorageMode) => {
    setModeState(next);
    await AsyncStorage.setItem(MODE_KEY, next);
  }, []);

  const setApiUrl = useCallback(async (url: string) => {
    const normalized = normalizeApiBaseUrl(url);
    const validationMessage = validateApiBaseUrl(normalized);
    if (validationMessage) {
      throw new AppError("VALIDATION", validationMessage);
    }
    setApiUrlState(normalized);
    await saveApiUrlOverride(normalized);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingComplete();
    setOnboardingCompleteState(true);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      onboardingComplete,
      mode,
      apiUrl,
      localMemberCount,
      setMode,
      setApiUrl,
      completeOnboarding,
      refreshLocalStats,
      dataRevision,
      bumpDataRevision,
    }),
    [
      ready,
      onboardingComplete,
      mode,
      apiUrl,
      localMemberCount,
      setMode,
      setApiUrl,
      completeOnboarding,
      refreshLocalStats,
      dataRevision,
      bumpDataRevision,
    ],
  );

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}

export function useStorage() {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage requires StorageProvider");
  return ctx;
}
