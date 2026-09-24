import { Platform, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

type ReferenceTextProps = {
  label?: string;
  code: string;
};

export function ReferenceText({ label, code }: ReferenceTextProps) {
  const theme = useTheme();

  return (
    <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
      {label ? `${label}: ` : ""}
      <Text style={styles.mono}>{code}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  mono: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    letterSpacing: 0.5,
  },
});
