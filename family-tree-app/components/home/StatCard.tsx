import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type StatCardProps = {
  value: number | string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-xl border border-border bg-card px-3 py-3 shadow-sm"
      accessibilityRole="text"
      accessibilityLabel={`${value} ${label}`}
    >
      <AppText variant="titleLarge" className="text-foreground font-semibold">
        {value}
      </AppText>
      <AppText variant="labelSmall" className="text-muted-foreground mt-0.5">
        {label}
      </AppText>
    </View>
  );
}
