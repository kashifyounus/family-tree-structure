import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  useTheme,
} from "react-native-paper";

import { SimpleBarChart } from "@/components/SimpleBarChart";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { loadReports } from "@/lib/data/personService";
import { buildLocalReports } from "@/lib/db/localReports";
import type { LocalReports } from "@/lib/data/types";
import type { OnlineReports } from "@/lib/api";

export default function ReportsScreen() {
  const theme = useTheme();
  const { mode } = useStorage();
  const { showError } = useAppFeedback();
  const [code, setCode] = useState(DEFAULT_FAMILY_CODE);
  const [loading, setLoading] = useState(false);
  const [local, setLocal] = useState<LocalReports | null>(null);
  const [online, setOnline] = useState<OnlineReports | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "local") {
        setLocal(buildLocalReports());
        setOnline(null);
      } else {
        const data = await loadReports(mode, code.trim());
        setOnline(data);
        setLocal(null);
      }
    } catch (e) {
      showError(e);
      setOnline(null);
    } finally {
      setLoading(false);
    }
  }, [code, mode, showError]);

  useEffect(() => {
    void load();
  }, [load]);

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
            mode="contained"
            onPress={() => void load()}
            style={styles.refreshBtn}
          >
            {copy.reports.loadInsights}
          </Button>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : mode === "local" && local ? (
        <View style={styles.section}>
          <Card mode="elevated" style={styles.statCard}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {copy.reports.membersLiving(local.memberCount, local.livingCount)}
              </Text>
            </Card.Content>
          </Card>
          <SimpleBarChart title={copy.reports.chartCity} data={local.cities} />
          <SimpleBarChart title={copy.reports.chartAge} data={local.ages} />
        </View>
      ) : online ? (
        <View style={styles.section}>
          {online.household && (
            <Card mode="elevated" style={styles.card}>
              <Card.Content style={styles.cardGap}>
                <Text variant="titleMedium">{copy.reports.householdTitle}</Text>
                <Text variant="bodyMedium">
                  {copy.reports.householdSummary(
                    online.household.wifeCount,
                    online.household.totalChildren,
                  )}
                </Text>
                {online.household.byWife.map((w) => (
                  <Text key={w.wifeName} variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {copy.reports.householdLine(w.wifeName, w.childrenCount)}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          )}
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
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {copy.reports.noDataCloud}
        </Text>
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
  card: { borderRadius: 16, marginBottom: 8 },
  cardGap: { gap: 6 },
});
