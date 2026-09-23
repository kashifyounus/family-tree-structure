import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

import type { ReportBucket } from "@/lib/data/types";

type SimpleBarChartProps = {
  title: string;
  data: ReportBucket[];
};

export function SimpleBarChart({ title, data }: SimpleBarChartProps) {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
          {title}
        </Text>
        {data.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text
              variant="labelSmall"
              numberOfLines={1}
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              {row.label}
            </Text>
            <View
              style={[styles.barTrack, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(row.count / max) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, width: 28, textAlign: "right" }}>
              {row.count}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  label: { width: 76 },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
});
