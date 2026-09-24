import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import {
  APP_COMPANY,
  APP_CREDIT_SUBTITLE,
  APP_VERSION_LABEL,
} from "@/constants/appMeta";

type CreditFooterProps = {
  showVersion?: boolean;
  inverted?: boolean;
};

export function CreditFooter({ showVersion = true, inverted = false }: CreditFooterProps) {
  const theme = useTheme();
  const primaryColor = inverted ? "rgba(255,255,255,0.95)" : theme.colors.onSurfaceVariant;
  const secondaryColor = inverted ? "rgba(255,255,255,0.8)" : theme.colors.onSurfaceVariant;

  return (
    <View style={styles.wrap}>
      {showVersion ? (
        <Text variant="labelSmall" style={{ color: secondaryColor, textAlign: "center" }}>
          Version {APP_VERSION_LABEL}
        </Text>
      ) : null}
      <Text variant="titleSmall" style={{ color: primaryColor, textAlign: "center", fontWeight: "600" }}>
        {APP_COMPANY}
      </Text>
      <Text variant="labelMedium" style={{ color: secondaryColor, textAlign: "center" }}>
        {APP_CREDIT_SUBTITLE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 2 },
});
