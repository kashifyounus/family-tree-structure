import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { fetchMembers, type DashboardMember } from "@/lib/api";

export default function MembersScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMembers(q);
      setMembers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load("");
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search name or family code"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void load(query)}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={() => void load(query)}>
          <Text style={styles.searchBtnText}>Go</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/tree",
                  params: { familyCode: item.familyCode },
                })
              }
            >
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.code}>{item.familyCode}</Text>
              <Text style={styles.meta}>
                {item.gender}
                {item.currentCity ? ` · ${item.currentCity}` : ""}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No members found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  searchBtnText: { color: "#fff", fontWeight: "600" },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#18181b" },
  code: { fontFamily: "SpaceMono", fontSize: 12, color: "#4f46e5", marginTop: 4 },
  meta: { fontSize: 12, color: "#71717a", marginTop: 4 },
  error: { color: "#dc2626", marginTop: 12 },
  empty: { textAlign: "center", color: "#71717a", marginTop: 24 },
});
