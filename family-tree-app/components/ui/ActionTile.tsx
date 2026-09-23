import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";

import { motion } from "@/theme/motion";
import { radius, space } from "@/theme/tokens";

type ActionTileProps = {
  icon: string;
  children: ReactNode;
  mode?: "contained" | "outlined" | "contained-tonal";
  onPress?: () => void;
  testID?: string;
  delay?: number;
};

export function ActionTile({
  icon,
  children,
  mode = "outlined",
  onPress,
  testID,
  delay = 0,
}: ActionTileProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(motion.normal)}>
      <Button
        testID={testID}
        mode={mode}
        icon={icon}
        onPress={onPress}
        contentStyle={styles.content}
        style={[
          styles.button,
          mode === "contained" && { backgroundColor: theme.colors.primary },
        ]}
      >
        {children}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
  },
  content: {
    paddingVertical: space.sm,
  },
});
