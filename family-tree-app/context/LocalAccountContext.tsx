import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  loadLocalAccountSession,
  registerLocalAccount,
  signInLocalAccount,
  signOutLocalAccount,
  type LocalAccountSession,
} from "@/lib/localAccount/service";
import type { Gender } from "@/lib/data/types";

type LocalAccountState = {
  loading: boolean;
  session: LocalAccountSession | null;
  register: (input: {
    displayName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: Gender;
  }) => Promise<LocalAccountSession>;
  signIn: (email: string, password: string) => Promise<LocalAccountSession>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const LocalAccountContext = createContext<LocalAccountState | null>(null);

export function LocalAccountProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LocalAccountSession | null>(null);

  const refresh = useCallback(async () => {
    const next = await loadLocalAccountSession();
    setSession(next);
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const register = useCallback(
    async (input: {
      displayName: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: Gender;
    }) => {
      const next = await registerLocalAccount(input);
      setSession(next);
      return next;
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await signInLocalAccount(email, password);
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await signOutLocalAccount();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      session,
      register,
      signIn,
      signOut,
      refresh,
    }),
    [loading, session, register, signIn, signOut, refresh],
  );

  return (
    <LocalAccountContext.Provider value={value}>{children}</LocalAccountContext.Provider>
  );
}

export function useLocalAccount() {
  const ctx = useContext(LocalAccountContext);
  if (!ctx) throw new Error("useLocalAccount requires LocalAccountProvider");
  return ctx;
}
