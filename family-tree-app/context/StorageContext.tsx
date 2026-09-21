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
  getApiBaseUrl,
  loadApiUrlOverride,
  saveApiUrlOverride,
} from "@/lib/api";

const MODE_KEY = "mughals_storage_mode";

type StorageState = {
  ready: boolean;
  mode: StorageMode;
  apiUrl: string;
  localMemberCount: number;
  setMode: (mode: StorageMode) => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
  refreshLocalStats: () => void;
  dataRevision: number;
  bumpDataRevision: () => void;
};

const StorageContext = createContext<StorageState | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
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
      setLocalMemberCount(countLocalMembers());
      setReady(true);
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
    const trimmed = url.trim().replace(/\/$/, "");
    setApiUrlState(trimmed);
    await saveApiUrlOverride(trimmed);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      mode,
      apiUrl,
      localMemberCount,
      setMode,
      setApiUrl,
      refreshLocalStats,
      dataRevision,
      bumpDataRevision,
    }),
    [
      ready,
      mode,
      apiUrl,
      localMemberCount,
      setMode,
      setApiUrl,
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
