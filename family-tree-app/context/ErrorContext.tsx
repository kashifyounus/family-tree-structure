import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet } from "react-native";
import { Snackbar, Text, useTheme, type MD3Theme } from "react-native-paper";

import { semantic } from "@/theme/paperTheme";

import type { AppError } from "@/lib/errors/AppError";
import { reportError, setErrorReporter } from "@/lib/errors/reportError";

type ErrorContextValue = {
  showError: (error: unknown, fallback?: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

type SnackKind = "error" | "success" | "info";

function snackColors(
  kind: SnackKind,
  theme: MD3Theme,
): { background: string; text: string; action: string } {
  switch (kind) {
    case "error":
      return {
        background: theme.colors.errorContainer,
        text: theme.colors.onErrorContainer,
        action: theme.colors.error,
      };
    case "success":
      return {
        background: semantic.successContainer,
        text: semantic.onSuccessContainer,
        action: semantic.success,
      };
    case "info":
      return {
        background: theme.colors.inverseSurface,
        text: theme.colors.inverseOnSurface,
        action: theme.colors.inversePrimary,
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function FeedbackSnackbar({
  visible,
  message,
  kind,
  onDismiss,
}: {
  visible: boolean;
  message: string;
  kind: SnackKind;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const colors = snackColors(kind, theme);

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={kind === "error" ? 6000 : 3500}
      action={{
        label: "Dismiss",
        onPress: onDismiss,
        textColor: colors.action,
      }}
      style={[styles.snackbar, { backgroundColor: colors.background }]}
    >
      <Text variant="bodyMedium" style={{ color: colors.text }}>
        {message}
      </Text>
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 8,
  },
});

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
      <FeedbackSnackbar
        visible={visible}
        message={message}
        kind={kind}
        onDismiss={() => setVisible(false)}
      />
    </ErrorContext.Provider>
  );
}

export function useAppFeedback() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useAppFeedback requires ErrorProvider");
  return ctx;
}
