import { StyleSheet, Text, View } from "react-native";

import type { ReportBucket } from "@/lib/data/types";

type SimpleBarChartProps = {
  title: string;
  data: ReportBucket[];
};

export function SimpleBarChart({ title, data }: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {data.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {row.label}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[styles.barFill, { width: `${(row.count / max) * 100}%` }]}
            />
          </View>
          <Text style={styles.count}>{row.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginBottom: 12,
  },
  title: { fontWeight: "700", marginBottom: 10, color: "#18181b" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  label: { width: 72, fontSize: 11, color: "#52525b" },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#6366f1", borderRadius: 5 },
  count: { width: 24, textAlign: "right", fontSize: 11, fontWeight: "600" },
});
