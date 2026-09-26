import { View } from "react-native";

import { StatCard } from "@/components/home/StatCard";
import type { LocalReports } from "@/lib/data/types";
import { copy } from "@/content/businessCopy";

type Props = {
  stats: LocalReports;
};

export function ReportsKpiStrip({ stats }: Props) {
  const items = [
    { value: stats.memberCount, label: copy.reports.kpiMembers },
    { value: stats.livingCount, label: copy.reports.kpiLiving },
    { value: stats.marriedCount, label: copy.reports.kpiMarried },
    { value: stats.divorceCount, label: copy.reports.kpiDivorces },
    { value: stats.maleCount, label: copy.reports.kpiMale },
    { value: stats.femaleCount, label: copy.reports.kpiFemale },
  ];

  return (
    <View className="gap-2 mb-4">
      <View className="flex-row gap-2">
        {items.slice(0, 3).map((item) => (
          <StatCard key={item.label} value={item.value} label={item.label} />
        ))}
      </View>
      <View className="flex-row gap-2">
        {items.slice(3).map((item) => (
          <StatCard key={item.label} value={item.value} label={item.label} />
        ))}
      </View>
    </View>
  );
}
