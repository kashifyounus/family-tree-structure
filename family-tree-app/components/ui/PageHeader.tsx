import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";

import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: string;
};

export function PageHeader({ title, subtitle, meta }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(motion.normal)} style={styles.wrap}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
        {title}
      </Text>
      {meta ? (
        <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: space.xs }}>
          {meta}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: space.sm, lineHeight: 22 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
});
