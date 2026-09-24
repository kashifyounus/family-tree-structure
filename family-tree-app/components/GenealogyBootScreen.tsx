import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { CreditFooter } from "@/components/CreditFooter";
import { APP_NAME, APP_TAGLINE } from "@/constants/appMeta";
import { space } from "@/theme/tokens";

type GenealogyBootScreenProps = {
  message?: string;
};

/** Branded splash while SQLite, preferences, or fonts initialize. */
export function GenealogyBootScreen({ message }: GenealogyBootScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.primary }]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Loading ${APP_NAME}`}
    >
      <Animated.View entering={FadeInUp.duration(500)} style={styles.card}>
        <Image
          source={require("@/assets/images/brand-logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          {APP_NAME}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          {APP_TAGLINE}
        </Text>
        <ActivityIndicator style={styles.spinner} color={theme.colors.primary} />
        {message ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {message}
          </Text>
        ) : null}
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.footer}>
        <CreditFooter inverted />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.xl,
  },
  card: {
    alignItems: "center",
    gap: space.sm,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
    maxWidth: 340,
    width: "100%",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  spinner: { marginTop: space.md },
  footer: {
    position: "absolute",
    bottom: space.xl,
    alignItems: "center",
  },
});
