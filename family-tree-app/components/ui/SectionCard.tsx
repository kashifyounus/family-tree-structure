import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";

import { motion } from "@/theme/motion";
import { radius, space } from "@/theme/tokens";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({
  title,
  subtitle,
  children,
  onPress,
  onLongPress,
  testID,
  delay = 0,
  style,
}: SectionCardProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(motion.normal)}>
      <Card
        testID={testID}
        mode="elevated"
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.card, { backgroundColor: theme.colors.surface }, style]}
      >
        <Card.Content style={styles.content}>
          {title ? (
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: space.xs }}
            >
              {subtitle}
            </Text>
          ) : null}
          {children}
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    marginBottom: space.md,
  },
  content: {
    gap: space.sm,
  },
});
