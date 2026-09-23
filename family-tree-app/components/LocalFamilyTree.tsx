import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

import { FamilyTreeGraphView } from "@/components/FamilyTreeGraphView";
import { copy } from "@/content/businessCopy";
import { formatGender } from "@/lib/format/gender";
import {
  buildLocalFamilyGraph,
  type BuildLocalGraphOptions,
} from "@/lib/graph/buildLocalFamilyGraph";
import { focalHasUnexpandedSiblings } from "@/lib/graph/explorationHints";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";
import type { GraphPersonSummary } from "@/lib/graph/types";

type LocalFamilyTreeProps = {
  familyCode: string;
  immersive?: boolean;
  layout?: "graph" | "list";
  onPersonPress?: (person: GraphPersonSummary) => void;
  zoomScale?: number;
  onZoomChange?: (scale: number) => void;
};

export function LocalFamilyTree({
  familyCode,
  immersive,
  layout = "graph",
  onPersonPress,
  zoomScale,
  onZoomChange,
}: LocalFamilyTreeProps) {
  const theme = useTheme();
  const router = useRouter();
  const view = layout;
  const [gensUp, setGensUp] = useState(2);
  const [gensDown, setGensDown] = useState(2);
  const [siblingSteps, setSiblingSteps] = useState(0);

  const graphOptions: BuildLocalGraphOptions = useMemo(
    () => ({
      generationsUp: gensUp,
      generationsDown: gensDown,
      siblingSteps,
    }),
    [gensUp, gensDown, siblingSteps],
  );

  const focal = useMemo(
    () => getLocalMemberByFamilyCode(familyCode),
    [familyCode],
  );
  const marriages = useMemo(
    () => (focal ? getLocalUnionsForPerson(focal.id) : []),
    [focal],
  );
  const graph = useMemo(
    () => buildLocalFamilyGraph(familyCode.trim(), graphOptions),
    [familyCode, graphOptions],
  );

  const canLoadMore = useCallback(() => {
    if (!focal || !graph) return { parents: false, children: false, siblings: false };
    const { allUnions } = loadKinshipDataset();
    const included = new Set(graph.nodes.map((n) => n.id));
    const ego = graph.nodes.find((n) => n.id === focal.id);
    return {
      parents: ego?.data.hasUnexpandedParents ?? false,
      children: ego?.data.hasUnexpandedChildren ?? false,
      siblings: focalHasUnexpandedSiblings(
        focal.id,
        included,
        allUnions,
        siblingSteps,
      ),
    };
  }, [focal, graph, siblingSteps]);

  const more = canLoadMore();

  const resetExpansion = () => {
    setGensUp(2);
    setGensDown(2);
    setSiblingSteps(0);
  };

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
      {view === "graph" && (
        <View style={styles.expandRow}>
          <Button
            compact
            mode="outlined"
            disabled={!more.parents}
            onPress={() => setGensUp((g) => g + 1)}
          >
            {copy.tree.loadParents}
          </Button>
          <Button
            compact
            mode="outlined"
            disabled={!more.siblings}
            onPress={() => setSiblingSteps((s) => s + 1)}
          >
            {copy.tree.loadSiblings}
          </Button>
          <Button
            compact
            mode="outlined"
            disabled={!more.children}
            onPress={() => setGensDown((g) => g + 1)}
          >
            {copy.tree.loadChildren}
          </Button>
        </View>
      )}
      {view === "graph" && graph ? (
        <FamilyTreeGraphView
          graph={graph}
          onPersonPress={onPersonPress}
          zoomScale={zoomScale}
          onZoomChange={onZoomChange}
        />
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
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    opacity: m.isActive ? 1 : 0.65,
                  },
                ]}
              >
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  {m.isActive ? copy.profile.currentMarriage : copy.profile.previousMarriage}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 4 }}>
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
      {!immersive && (
        <Button mode="text" onPress={resetExpansion}>
          {copy.tree.menuReload}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  expandRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
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
