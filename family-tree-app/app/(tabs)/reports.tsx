import { useCallback, useEffect, useMemo, useState } from "react";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StyleSheet, View } from "react-native";

import { HouseholdOverviewCard } from "@/components/reports/HouseholdOverviewCard";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { loadReports } from "@/lib/data/personService";
import { buildLocalReports } from "@/lib/db/localReports";
import type { LocalReports } from "@/lib/data/types";
import type { OnlineReports } from "@/lib/api";
import {
  buildLocalHouseholdReport,
  type HouseholdReportView,
} from "@/lib/reports/householdReport";
import {
  resolveCloudFocalFamilyCode,
  resolveLocalFocalFamilyCode,
} from "@/lib/tree/focalFamilyCode";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

function onlineHouseholdView(
  household: NonNullable<OnlineReports["household"]>,
): HouseholdReportView {
  return {
    husbandName: household.husbandName ?? "",
    wifeCount: household.wifeCount,
    totalChildren: household.totalChildren,
    byWife: household.byWife.map((w) => ({
      wifeName: w.wifeName,
      childrenCount: w.childrenCount,
    })),
  };
}

export default function ReportsScreen() {
  const theme = useAppTheme();
  const { mode, dataRevision } = useStorage();
  const localAccount = useLocalAccount();
  const { showError } = useAppFeedback();
  const [code, setCode] = useState(DEFAULT_FAMILY_CODE);
  const [loading, setLoading] = useState(false);
  const [local, setLocal] = useState<LocalReports | null>(null);
  const [localHousehold, setLocalHousehold] = useState<HouseholdReportView | null>(
    null,
  );
  const [online, setOnline] = useState<OnlineReports | null>(null);

  useEffect(() => {
    void (async () => {
      const focal =
        mode === "local"
          ? resolveLocalFocalFamilyCode(localAccount.session?.focalFamilyCode)
          : await resolveCloudFocalFamilyCode(
              localAccount.session?.focalFamilyCode,
            );
      setCode(focal);
    })();
  }, [mode, localAccount.session?.focalFamilyCode, dataRevision]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const trimmed = code.trim();
      if (mode === "local") {
        setLocal(buildLocalReports());
        setLocalHousehold(
          trimmed ? buildLocalHouseholdReport(trimmed) : null,
        );
        setOnline(null);
      } else {
        const data = await loadReports(mode, trimmed);
        setOnline(data);
        setLocal(null);
        setLocalHousehold(null);
      }
    } catch (e) {
      showError(e);
      setOnline(null);
      setLocalHousehold(null);
    } finally {
      setLoading(false);
    }
  }, [code, mode, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const onlineHousehold = useMemo(() => {
    if (!online?.household) return null;
    return onlineHouseholdView(online.household);
  }, [online]);

  const householdHusbandLabel = useCallback((name: string) => {
    const trimmed = name.trim();
    return trimmed ? copy.reports.householdForHusband(trimmed) : undefined;
  }, []);

  return (
    <Screen testID="reports-screen" keyboardAvoiding>
      <PageHeader
        title={copy.reports.screenTitle}
        subtitle={mode === "local" ? copy.reports.bannerPrivate : copy.reports.bannerCloud}
      />

      {mode === "online" && (
        <View style={styles.row}>
          <FormTextInput
            testID="reports-reference-input"
            style={styles.input}
            label={copy.reports.focalReference}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <Button
            testID="reports-refresh"
            onPress={() => void load()}
            style={styles.refreshBtn}
          >
            <ButtonText>{copy.reports.loadInsights}</ButtonText>
          </Button>
        </View>
      )}

      {loading ? (
        <Spinner size="large" style={styles.loader} />
      ) : mode === "local" && local ? (
        <View style={styles.section}>
          <AppCard style={styles.statCard}>
            <AppCardContent>
              <AppText variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {copy.reports.membersLiving(local.memberCount, local.livingCount)}
              </AppText>
            </AppCardContent>
          </AppCard>
          {localHousehold ? (
            <HouseholdOverviewCard
              household={localHousehold}
              husbandLabel={householdHusbandLabel(localHousehold.husbandName)}
            />
          ) : null}
          <SimpleBarChart title={copy.reports.chartCity} data={local.cities} />
          <SimpleBarChart title={copy.reports.chartAge} data={local.ages} />
        </View>
      ) : online ? (
        <View style={styles.section}>
          {onlineHousehold ? (
            <HouseholdOverviewCard
              household={onlineHousehold}
              husbandLabel={
                onlineHousehold.husbandName
                  ? householdHusbandLabel(onlineHousehold.husbandName)
                  : undefined
              }
            />
          ) : null}
          {online.city && (
            <SimpleBarChart
              title={copy.reports.chartCityCloud}
              data={online.city.currentCity.map((c) => ({
                label: c.label,
                count: c.count,
              }))}
            />
          )}
          <SimpleBarChart
            title={copy.reports.chartAgeCloud}
            data={online.ages.map((a) => ({ label: a.range, count: a.count }))}
          />
        </View>
      ) : (
        <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {copy.reports.noDataCloud}
        </AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 12 },
  input: { flex: 1 },
  refreshBtn: { marginTop: 6 },
  loader: { marginTop: 24 },
  section: { gap: 4 },
  statCard: { borderRadius: 16, marginBottom: 8 },
});
