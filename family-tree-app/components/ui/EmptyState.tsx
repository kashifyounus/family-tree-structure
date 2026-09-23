import { StyleSheet, View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";

type EmptyStateProps = {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = "account-search", title, body, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(motion.normal)} style={styles.wrap}>
      <View style={[styles.iconRing, { backgroundColor: theme.colors.primaryContainer }]}>
        <Icon source={icon} size={36} color={theme.colors.primary} />
      </View>
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, textAlign: "center" }}>
        {title}
      </Text>
      {body ? (
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginTop: space.sm }}
        >
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained-tonal" onPress={onAction} style={{ marginTop: space.lg }}>
          {actionLabel}
        </Button>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: space.section,
    paddingHorizontal: space.xl,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
});
