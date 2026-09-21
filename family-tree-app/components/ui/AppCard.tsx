import { Card } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";
import type { ReactNode } from "react";

type AppCardProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ delay = 0, style, children }: AppCardProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(280)}>
      <Card style={[{ borderRadius: 16 }, style]}>{children}</Card>
    </Animated.View>
  );
}
