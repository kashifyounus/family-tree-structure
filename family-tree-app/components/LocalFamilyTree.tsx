import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { copy } from "@/content/businessCopy";
import { formatGender } from "@/lib/format/gender";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";

type LocalFamilyTreeProps = {
  familyCode: string;
  immersive?: boolean;
};

export function LocalFamilyTree({ familyCode, immersive }: LocalFamilyTreeProps) {
  const router = useRouter();
  const focal = useMemo(
    () => getLocalMemberByFamilyCode(familyCode),
    [familyCode],
  );
  const marriages = useMemo(
    () => (focal ? getLocalUnionsForPerson(focal.id) : []),
    [focal],
  );

  if (!focal) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{copy.tree.notFound}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, immersive && styles.scrollImmersive]}
      contentContainerStyle={[styles.content, immersive && styles.contentImmersive]}
    >
      <Pressable
        style={styles.focalCard}
        onPress={() =>
          router.push({
            pathname: "/member/[personId]",
            params: { personId: focal.id, code: focal.familyCode },
          })
        }
      >
        <Text style={styles.focalName}>
          {focal.firstName} {focal.lastName}
        </Text>
        <Text style={styles.code}>{focal.familyCode}</Text>
        {(focal.urduFirstName || focal.urduLastName) && (
          <Text style={styles.urdu}>
            {focal.urduFirstName} {focal.urduLastName}
          </Text>
        )}
        <Text style={styles.meta}>{formatGender(focal.gender)}</Text>
        <Text style={styles.tapHint}>{copy.tree.tapProfile}</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, immersive && styles.sectionTitleImmersive]}>
        {copy.tree.marriagesSection}
      </Text>
      {marriages.length === 0 ? (
        <Text style={styles.hint}>{copy.tree.noMarriages}</Text>
      ) : (
        marriages.map((m) => (
          <View key={m.id} style={styles.marriageCard}>
            <Text style={styles.marriageTitle}>
              {copy.tree.marriageTo(m.partner1Name, m.partner2Name)}
            </Text>
            {m.children.length === 0 ? (
              <Text style={styles.hint}>{copy.tree.noChildrenInMarriage}</Text>
            ) : (
              m.children.map((c) => (
                <Text key={c.id} style={styles.childLine}>
                  · {copy.tree.childLine(c.name, c.familyCode)}
                </Text>
              ))
            )}
          </View>
        ))
      )}
      <Text style={styles.footerNote}>{copy.tree.privateFooter}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f4f4f5" },
  scrollImmersive: { backgroundColor: "#0f172a" },
  content: { padding: 12, paddingBottom: 32 },
  contentImmersive: { paddingBottom: 48, flexGrow: 1 },
  empty: { flex: 1, padding: 20, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#cbd5e1", lineHeight: 22 },
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
  tapHint: { marginTop: 8, fontSize: 11, color: "#4f46e5" },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#18181b",
  },
  sectionTitleImmersive: { color: "#e2e8f0" },
  marriageCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  marriageTitle: { fontWeight: "600", color: "#18181b" },
  childLine: { marginTop: 4, fontSize: 13, color: "#3f3f46" },
  hint: { fontSize: 12, color: "#a1a1aa", marginTop: 4 },
  footerNote: {
    marginTop: 24,
    fontSize: 11,
    lineHeight: 16,
    color: "#94a3b8",
  },
});
