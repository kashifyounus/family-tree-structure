import { Card } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { motion } from "@/theme/motion";
import { radius } from "@/theme/tokens";

type AppCardProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  mode?: "elevated" | "outlined" | "contained";
};

export function AppCard({ delay = 0, style, children, mode = "elevated" }: AppCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(motion.normal)}>
      <Card mode={mode} style={[{ borderRadius: radius.lg }, style]}>{children}</Card>
    </Animated.View>
  );
}
