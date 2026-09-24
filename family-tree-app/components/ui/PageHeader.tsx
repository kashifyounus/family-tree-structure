import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";
import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: string;
};

export function PageHeader({ title, subtitle, meta }: PageHeaderProps) {
  const theme = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.duration(motion.normal)} style={styles.wrap}>
      <AppText variant="headlineSmall">{title}</AppText>
      {meta ? (
        <AppText variant="labelLarge" style={{ color: theme.colors.primary, marginTop: space.xs }}>
          {meta}
        </AppText>
      ) : null}
      {subtitle ? (
        <AppText variant="bodyMedium" className="mt-2 leading-6 text-muted-foreground">
          {subtitle}
        </AppText>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
});
