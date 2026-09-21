import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Snackbar } from "react-native-paper";

import type { AppError } from "@/lib/errors/AppError";
import { reportError, setErrorReporter } from "@/lib/errors/reportError";

type ErrorContextValue = {
  showError: (error: unknown, fallback?: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

type SnackKind = "error" | "success" | "info";

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<SnackKind>("info");

  const present = useCallback((text: string, nextKind: SnackKind) => {
    setMessage(text);
    setKind(nextKind);
    setVisible(true);
  }, []);

  const showError = useCallback((error: unknown, fallback?: string) => {
    const appError = reportError(error, fallback);
    present(appError.userMessage, "error");
  }, [present]);

  const showSuccess = useCallback(
    (text: string) => present(text, "success"),
    [present],
  );

  const showInfo = useCallback((text: string) => present(text, "info"), [present]);

  useEffect(() => {
    setErrorReporter((err: AppError) => {
      present(err.userMessage, "error");
    });
    return () => setErrorReporter(null);
  }, [present]);

  const value = useMemo(
    () => ({ showError, showSuccess, showInfo }),
    [showError, showSuccess, showInfo],
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={kind === "error" ? 6000 : 3500}
        action={{ label: "Dismiss", onPress: () => setVisible(false) }}
        style={
          kind === "error"
            ? { backgroundColor: "#b91c1c" }
            : kind === "success"
              ? { backgroundColor: "#047857" }
              : undefined
        }
      >
        {message}
      </Snackbar>
    </ErrorContext.Provider>
  );
}

export function useAppFeedback() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useAppFeedback requires ErrorProvider");
  return ctx;
}
