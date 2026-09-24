import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { semantic } from "@/theme/appTheme";
import { useAppTheme } from "@/theme/useAppTheme";

import type { AppError } from "@/lib/errors/AppError";
import { reportError, setErrorReporter } from "@/lib/errors/reportError";

type ErrorContextValue = {
  showError: (error: unknown, fallback?: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

type SnackKind = "error" | "success" | "info";

function snackStyle(kind: SnackKind, colors: ReturnType<typeof useAppTheme>["colors"]) {
  switch (kind) {
    case "error":
      return {
        background: colors.errorContainer,
        text: colors.onErrorContainer,
        action: colors.error,
      };
    case "success":
      return {
        background: semantic.successContainer,
        text: semantic.onSuccessContainer,
        action: semantic.success,
      };
    case "info":
      return {
        background: colors.inverseSurface,
        text: colors.inverseOnSurface,
        action: colors.inversePrimary,
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function FeedbackToast({
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
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const colors = snackStyle(kind, theme.colors);

  if (!visible) return null;

  return (
    <View
      className="absolute left-3 right-3 rounded-xl px-4 py-3 flex-row items-center gap-3 shadow-lg"
      style={{
        bottom: Math.max(insets.bottom, 12) + 8,
        backgroundColor: colors.background,
      }}
    >
      <AppText variant="bodyMedium" className="flex-1" style={{ color: colors.text }}>
        {message}
      </AppText>
      <Pressable onPress={onDismiss} accessibilityRole="button">
        <AppText variant="labelLarge" style={{ color: colors.action }}>Dismiss</AppText>
      </Pressable>
    </View>
  );
}

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

  useEffect(() => {
    if (!visible) return;
    const duration = kind === "error" ? 6000 : 3500;
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [visible, kind, message]);

  const value = useMemo(
    () => ({ showError, showSuccess, showInfo }),
    [showError, showSuccess, showInfo],
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <FeedbackToast
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
