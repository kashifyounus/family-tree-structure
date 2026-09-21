import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { copy } from "@/content/businessCopy";
import { APP_OWNER_EMAIL } from "@/constants/appMeta";
import { getAuthToken, loginApi, setAuthToken } from "@/lib/api";
import { presentUserMessage } from "@/lib/errors/presentError";

type AuthState = {
  loading: boolean;
  token: string | null;
  role: string | null;
  displayName: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = await getAuthToken();
      setToken(stored);
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    if (!res.ok || !("token" in res)) {
      return presentUserMessage(new Error(res.error), copy.errors.auth);
    }
    await setAuthToken(res.token);
    setToken(res.token);
    setRole(res.role);
    setDisplayName(res.displayName);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await setAuthToken(null);
    setToken(null);
    setRole(null);
    setDisplayName(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      token,
      role,
      displayName,
      signIn,
      signOut,
    }),
    [loading, token, role, displayName, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}

export const DEFAULT_LOGIN_EMAIL = APP_OWNER_EMAIL;
export const DEFAULT_LOGIN_PASSWORD = "mughal";
