import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SegmentedButtons, Text, useTheme } from "react-native-paper";

import { FamilyTreeGraphView } from "@/components/FamilyTreeGraphView";
import { copy } from "@/content/businessCopy";
import { formatGender } from "@/lib/format/gender";
import { buildLocalFamilyGraph } from "@/lib/graph/buildLocalFamilyGraph";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";

type LocalFamilyTreeProps = {
  familyCode: string;
  immersive?: boolean;
};

type ViewMode = "graph" | "list";

export function LocalFamilyTree({ familyCode, immersive }: LocalFamilyTreeProps) {
  const theme = useTheme();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("graph");
  const focal = useMemo(
    () => getLocalMemberByFamilyCode(familyCode),
    [familyCode],
  );
  const marriages = useMemo(
    () => (focal ? getLocalUnionsForPerson(focal.id) : []),
    [focal],
  );
  const graph = useMemo(
    () => buildLocalFamilyGraph(familyCode.trim()),
    [familyCode],
  );

  if (!focal) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          {copy.tree.notFound}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, immersive && { backgroundColor: theme.colors.background }]}>
      <View style={styles.toggleWrap}>
        <SegmentedButtons
          value={view}
          onValueChange={(v) => setView(v as ViewMode)}
          buttons={[
            { value: "graph", label: copy.tree.graphView, icon: "graph" },
            { value: "list", label: copy.tree.listView, icon: "format-list-bulleted" },
          ]}
        />
      </View>
      {view === "graph" && graph ? (
        <FamilyTreeGraphView graph={graph} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={[
              styles.focalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId: focal.id, code: focal.familyCode },
              })
            }
          >
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {focal.firstName} {focal.lastName}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
              {focal.familyCode}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {formatGender(focal.gender)}
              {focal.birthDate ? ` · ${focal.birthDate}` : ""}
              {focal.currentCity ? ` · ${focal.currentCity}` : ""}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 8 }}>
              {copy.tree.tapProfile}
            </Text>
          </Pressable>

          <Text variant="titleSmall" style={{ color: theme.colors.onBackground, marginTop: 16 }}>
            {copy.tree.marriagesSection}
          </Text>
          {marriages.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {copy.tree.noMarriages}
            </Text>
          ) : (
            marriages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.marriageCard,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  {copy.tree.marriageTo(m.partner1Name, m.partner2Name)}
                </Text>
                {m.children.length === 0 ? (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {copy.tree.noChildrenInMarriage}
                  </Text>
                ) : (
                  m.children.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() =>
                        router.push({
                          pathname: "/member/[personId]",
                          params: { personId: c.id, code: c.familyCode },
                        })
                      }
                    >
                      <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
                        · {copy.tree.childLine(c.name, c.familyCode)}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            ))
          )}
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            {copy.tree.privateFooter}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toggleWrap: { paddingHorizontal: 12, paddingVertical: 8 },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  empty: { flex: 1, padding: 20, justifyContent: "center" },
  focalCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  marriageCard: {
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
});
