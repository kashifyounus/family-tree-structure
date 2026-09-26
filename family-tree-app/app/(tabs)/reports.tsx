import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { HouseholdOverviewCard } from "@/components/reports/HouseholdOverviewCard";
import { ReportsKpiStrip } from "@/components/reports/ReportsKpiStrip";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { OutlineChip } from "@/components/ui/OutlineChip";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AppText } from "@/components/ui/AppText";
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
import { REPORT_PRESETS } from "@/lib/reports/reportPresets";
import {
  resolveCloudFocalFamilyCode,
  resolveLocalFocalFamilyCode,
} from "@/lib/tree/focalFamilyCode";
import { useAppTheme } from "@/theme/useAppTheme";

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
  const router = useRouter();
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
  const [activePreset, setActivePreset] = useState<string | null>(null);

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
    <Screen testID="reports-screen" keyboardAvoiding scroll>
      <PageHeader
        title={copy.reports.screenTitle}
        subtitle={mode === "local" ? copy.reports.bannerPrivate : copy.reports.bannerCloud}
      />

      {mode === "online" && (
        <View className="flex-row gap-2 items-start mb-3">
          <FormTextInput
            testID="reports-reference-input"
            style={{ flex: 1 }}
            label={copy.reports.focalReference}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <Button
            testID="reports-refresh"
            onPress={() => void load()}
            className="mt-1.5"
          >
            <ButtonText>{copy.reports.loadInsights}</ButtonText>
          </Button>
        </View>
      )}

      {loading ? (
        <Spinner size="large" className="mt-6" />
      ) : mode === "local" && local ? (
        <View>
          <ReportsKpiStrip stats={local} />

          <SectionCard title={copy.reports.presetsTitle} subtitle={copy.reports.presetsHint}>
            <View className="flex-row flex-wrap gap-2">
              {REPORT_PRESETS.map((preset) => (
                <OutlineChip
                  key={preset.id}
                  label={preset.title}
                  selected={activePreset === preset.id}
                  onPress={() => {
                    setActivePreset(preset.id);
                    router.push({
                      pathname: "/reports-custom",
                      params: { preset: preset.id },
                    });
                  }}
                />
              ))}
            </View>
          </SectionCard>

          <PrimaryPillButton
            testID="reports-custom-cta"
            label={copy.reports.customCta}
            onPress={() => router.push("/reports-custom")}
          />

          {localHousehold ? (
            <View className="mt-4">
              <HouseholdOverviewCard
                household={localHousehold}
                husbandLabel={householdHusbandLabel(localHousehold.husbandName)}
              />
            </View>
          ) : null}

          <View className="mt-2">
            <SimpleBarChart title={copy.reports.chartCity} data={local.cities} />
            <SimpleBarChart title={copy.reports.chartAge} data={local.ages} />
          </View>
        </View>
      ) : online ? (
        <View>
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
