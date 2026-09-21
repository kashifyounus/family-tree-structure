import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { APP_NAME } from "@/constants/appMeta";

type BrandLogoProps = {
  size?: number;
  showTitle?: boolean;
};

export function BrandLogo({ size = 88, showTitle = true }: BrandLogoProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={APP_NAME}>
      <Image
        source={require("@/assets/images/brand-logo.png")}
        style={{ width: size, height: size, borderRadius: size / 5 }}
        resizeMode="cover"
      />
      {showTitle && (
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          {APP_NAME}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12 },
  title: { fontWeight: "700", textAlign: "center" },
});
