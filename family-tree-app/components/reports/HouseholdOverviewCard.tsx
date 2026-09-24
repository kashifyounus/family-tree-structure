import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import type { HouseholdReportView } from "@/lib/reports/householdReport";
import { useAppTheme } from "@/theme/useAppTheme";
import { StyleSheet } from "react-native";

type Props = {
  household: HouseholdReportView;
  husbandLabel?: string;
};

export function HouseholdOverviewCard({ household, husbandLabel }: Props) {
  const theme = useAppTheme();

  return (
    <AppCard style={styles.card}>
      <AppCardContent style={styles.gap}>
        <AppText variant="titleMedium">{copy.reports.householdTitle}</AppText>
        {husbandLabel ? (
          <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {husbandLabel}
          </AppText>
        ) : null}
        <AppText variant="bodyMedium">
          {copy.reports.householdSummary(
            household.wifeCount,
            household.totalChildren,
          )}
        </AppText>
        {household.byWife.map((w, index) => (
          <AppText
            key={`${w.wifeName}-${index}`}
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {copy.reports.householdLine(w.wifeName, w.childrenCount)}
          </AppText>
        ))}
      </AppCardContent>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginBottom: 8 },
  gap: { gap: 6 },
});
