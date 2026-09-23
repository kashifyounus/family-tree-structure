import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

import { copy } from "@/content/businessCopy";
import { reportError } from "@/lib/errors/reportError";

type Props = { children: ReactNode };
type State = { error: Error | null };

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
        <View style={styles.fallback}>
          <Text variant="headlineSmall">{copy.errors.boundaryTitle}</Text>
          <Text variant="bodyMedium" style={styles.message}>
            {copy.errors.boundaryBody}
          </Text>
          <Button mode="contained" onPress={() => this.setState({ error: null })}>
            {copy.errors.tryAgain}
          </Button>
        </View>
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
    backgroundColor: "#f8fafc",
  },
  message: { color: "#64748b" },
});
