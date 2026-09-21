import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
});
