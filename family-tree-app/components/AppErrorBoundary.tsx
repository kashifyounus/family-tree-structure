import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { log } from "@/lib/logging/logger";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error("boundary", "React render error", error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center p-6 gap-4 bg-background">
          <AppText variant="titleLarge">Something went wrong</AppText>
          <AppText variant="bodySmall" className="text-center text-muted-foreground">
            {this.state.error.message}
          </AppText>
          <Button onPress={() => this.setState({ error: null })}>
            <ButtonText>Try again</ButtonText>
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}
