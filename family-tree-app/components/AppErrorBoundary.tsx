import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { CreditFooter } from "@/components/CreditFooter";
import { APP_NAME } from "@/constants/appMeta";
import { copy } from "@/content/businessCopy";
import { reportError } from "@/lib/errors/reportError";

type Props = { children: ReactNode };
type State = { error: Error | null };

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
        {copy.errors.boundaryTitle}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {copy.errors.boundaryBody}
      </Text>
      <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 8 }}>
        {APP_NAME}
      </Text>
      <Button mode="contained" onPress={onRetry} style={{ marginTop: 16 }}>
        {copy.errors.tryAgain}
      </Button>
      <View style={styles.credit}>
        <CreditFooter />
      </View>
    </View>
  );
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, copy.errors.boundaryBody);
    if (__DEV__) {
      console.error(info.componentStack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback onRetry={() => this.setState({ error: null })} />
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  credit: {
    marginTop: 32,
    alignItems: "center",
  },
});
