import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";

import { SimpleBarChart } from "@/components/SimpleBarChart";
import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { useStorage } from "@/context/StorageContext";
import { loadReports } from "@/lib/data/personService";
import { buildLocalReports } from "@/lib/db/localReports";
import type { LocalReports } from "@/lib/data/types";
import type { OnlineReports } from "@/lib/api";

export default function ReportsScreen() {
  const { mode } = useStorage();
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
    } finally {
      setLoading(false);
    }
  }, [code, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.banner}>
        {mode === "local"
          ? "Stats from SQLite on this device"
          : "Stats from shared PostgreSQL (API)"}
      </Text>
      {mode === "online" && (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Focal family code"
          />
          <Pressable style={styles.btn} onPress={() => void load()}>
            <Text style={styles.btnText}>Load</Text>
          </Pressable>
        </View>
      )}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : mode === "local" && local ? (
        <>
          <Text style={styles.stat}>
            {local.memberCount} members · {local.livingCount} living
          </Text>
          <SimpleBarChart title="Current city" data={local.cities} />
          <SimpleBarChart title="Age groups" data={local.ages} />
        </>
      ) : online ? (
        <>
          {online.household && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Household</Text>
              <Text>
                {online.household.wifeCount} spouse union(s) ·{" "}
                {online.household.totalChildren} children
              </Text>
              {online.household.byWife.map((w) => (
                <Text key={w.wifeName} style={styles.line}>
                  {w.wifeName}: {w.childrenCount} child(ren)
                </Text>
              ))}
            </View>
          )}
          {online.city && (
            <SimpleBarChart
              title="Current city (network)"
              data={online.city.currentCity.map((c) => ({
                label: c.label,
                count: c.count,
              }))}
            />
          )}
          <SimpleBarChart
            title="Age groups (network)"
            data={online.ages.map((a) => ({ label: a.range, count: a.count }))}
          />
        </>
      ) : (
        <Text style={styles.hint}>No report data. Check API URL and family code.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  banner: { fontSize: 12, fontWeight: "600", color: "#4338ca", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  stat: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  card: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "700", marginBottom: 6 },
  line: { fontSize: 13, color: "#52525b", marginTop: 4 },
  hint: { color: "#71717a", marginTop: 16 },
});
