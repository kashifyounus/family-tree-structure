import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";

type LocalFamilyTreeProps = {
  familyCode: string;
};

export function LocalFamilyTree({ familyCode }: LocalFamilyTreeProps) {
  const focal = useMemo(
    () => getLocalMemberByFamilyCode(familyCode),
    [familyCode],
  );
  const unions = useMemo(
    () => (focal ? getLocalUnionsForPerson(focal.id) : []),
    [focal],
  );

  if (!focal) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No local member with code {familyCode}. Try another code or add a
          member in the Members tab.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.focalCard}>
        <Text style={styles.focalName}>
          {focal.firstName} {focal.lastName}
        </Text>
        <Text style={styles.code}>{focal.familyCode}</Text>
        {(focal.urduFirstName || focal.urduLastName) && (
          <Text style={styles.urdu}>
            {focal.urduFirstName} {focal.urduLastName}
          </Text>
        )}
        <Text style={styles.meta}>{focal.gender}</Text>
      </View>

      <Text style={styles.sectionTitle}>Unions & children (on this device)</Text>
      {unions.length === 0 ? (
        <Text style={styles.hint}>No unions recorded yet for this person.</Text>
      ) : (
        unions.map((u) => (
          <View key={u.id} style={styles.unionCard}>
            <Text style={styles.unionTitle}>
              {u.partner1Name} & {u.partner2Name}
            </Text>
            {u.children.length === 0 ? (
              <Text style={styles.hint}>No children in this union.</Text>
            ) : (
              u.children.map((c) => (
                <Text key={c.id} style={styles.childLine}>
                  · {c.name} ({c.familyCode})
                </Text>
              ))
            )}
          </View>
        ))
      )}
      <Text style={styles.footerNote}>
        Local SQLite mode keeps all data on this phone only. Switch to Online in
        Account to use the shared PostgreSQL database via API.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f4f4f5" },
  content: { padding: 12, paddingBottom: 32 },
  empty: { flex: 1, padding: 20, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#71717a", lineHeight: 20 },
  focalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#818cf8",
  },
  focalName: { fontSize: 20, fontWeight: "700", color: "#18181b" },
  code: { fontFamily: "SpaceMono", color: "#4f46e5", marginTop: 4 },
  urdu: { fontSize: 18, marginTop: 8, color: "#3f3f46" },
  meta: { marginTop: 8, fontSize: 12, color: "#71717a" },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#18181b",
  },
  unionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  unionTitle: { fontWeight: "600", color: "#18181b" },
  childLine: { marginTop: 4, fontSize: 13, color: "#3f3f46" },
  hint: { fontSize: 12, color: "#a1a1aa", marginTop: 4 },
  footerNote: {
    marginTop: 24,
    fontSize: 11,
    lineHeight: 16,
    color: "#71717a",
  },
});
