import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/card";
import type { ReportBucket } from "@/lib/data/types";
import { useAppTheme } from "@/theme/useAppTheme";

type SimpleBarChartProps = {
  title: string;
  data: ReportBucket[];
};

export function SimpleBarChart({ title, data }: SimpleBarChartProps) {
  const theme = useAppTheme();
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="p-4 mb-3 border border-border">
      <AppText variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
        {title}
      </AppText>
      {data.map((row) => (
        <View key={row.label} style={styles.row}>
          <AppText
            variant="labelSmall"
            numberOfLines={1}
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            {row.label}
          </AppText>
          <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
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
          <AppText
            variant="labelMedium"
            style={{ color: theme.colors.onSurface, width: 28, textAlign: "right" }}
          >
            {row.count}
          </AppText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  label: { width: 72 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
});
