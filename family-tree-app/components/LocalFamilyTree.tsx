import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { GraphWebView } from "@/components/tree/GraphWebView";
import { copy } from "@/content/businessCopy";
import { formatDisplayDate } from "@/lib/format/displayDate";
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
import { memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";
import type { GraphPersonSummary } from "@/lib/graph/types";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import {
  DEFAULT_TREE_EXPANSION,
  expandTreeToMaximum,
  stepExpandTree,
  treeExpansionHasMore,
  type TreeExpansionState,
} from "../../../shared/genealogy/treeExpansion";
import type { MarriageLayoutUnion } from "../../../shared/marriageTreeLayout";

type LocalFamilyTreeProps = {
  familyCode: string;
  /** Bumps when local SQLite data changes so the graph rebuilds. */
  dataRevision?: number;
  immersive?: boolean;
  layout?: "graph" | "list";
  onPersonPress?: (person: GraphPersonSummary) => void;
  onPersonLongPress?: (person: GraphPersonSummary) => void;
  /** List mode: tap a child name to recenter the tree on them. */
  onRecenterOnFamilyCode?: (familyCode: string) => void;
  zoomScale?: number;
  onZoomChange?: (scale: number) => void;
  pathHighlightPersonIds?: string[];
  highlightPersonIds?: string[];
  ensurePersonIds?: string[];
  seedGenerationsUp?: number;
  seedGenerationsDown?: number;
};

function initialTreeExpansion(
  seedGenerationsUp?: number,
  seedGenerationsDown?: number,
): TreeExpansionState {
  return {
    generationsUp: Math.max(
      DEFAULT_TREE_EXPANSION.generationsUp,
      seedGenerationsUp ?? DEFAULT_TREE_EXPANSION.generationsUp,
    ),
    generationsDown: Math.max(
      DEFAULT_TREE_EXPANSION.generationsDown,
      seedGenerationsDown ?? DEFAULT_TREE_EXPANSION.generationsDown,
    ),
    siblingSteps: DEFAULT_TREE_EXPANSION.siblingSteps,
    cousinDegree: DEFAULT_TREE_EXPANSION.cousinDegree,
  };
}

function toLayoutUnions(
  allUnions: ReturnType<typeof loadKinshipDataset>["allUnions"],
): MarriageLayoutUnion[] {
  return allUnions.map((u) => ({
    id: u.id,
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    childships: u.childships.map((c) => ({ childId: c.childId })),
  }));
}

export function LocalFamilyTree({
  familyCode,
  dataRevision = 0,
  immersive,
  layout = "graph",
  onPersonPress,
  onPersonLongPress,
  onRecenterOnFamilyCode,
  zoomScale,
  onZoomChange,
  pathHighlightPersonIds,
  highlightPersonIds,
  ensurePersonIds,
  seedGenerationsUp,
  seedGenerationsDown,
}: LocalFamilyTreeProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const view = layout;
  const [expansion, setExpansion] = useState<TreeExpansionState>(() =>
    initialTreeExpansion(seedGenerationsUp, seedGenerationsDown),
  );

  useEffect(() => {
    if (seedGenerationsUp != null || seedGenerationsDown != null) {
      setExpansion((prev) => ({
        ...prev,
        generationsUp: Math.max(
          prev.generationsUp,
          seedGenerationsUp ?? DEFAULT_TREE_EXPANSION.generationsUp,
        ),
        generationsDown: Math.max(
          prev.generationsDown,
          seedGenerationsDown ?? DEFAULT_TREE_EXPANSION.generationsDown,
        ),
      }));
    }
  }, [seedGenerationsUp, seedGenerationsDown]);

  useEffect(() => {
    setExpansion(initialTreeExpansion(seedGenerationsUp, seedGenerationsDown));
  }, [familyCode, dataRevision, seedGenerationsUp, seedGenerationsDown]);

  const graphOptions: BuildLocalGraphOptions = useMemo(
    () => ({
      generationsUp: expansion.generationsUp,
      generationsDown: expansion.generationsDown,
      siblingSteps: expansion.siblingSteps,
      cousinDegree: expansion.cousinDegree,
      ensurePersonIds,
    }),
    [expansion, ensurePersonIds],
  );

  const focal = useMemo(
    () => getLocalMemberByFamilyCode(familyCode),
    [familyCode, dataRevision],
  );
  const marriages = useMemo(
    () => (focal ? getLocalUnionsForPerson(focal.id) : []),
    [focal, dataRevision],
  );
  const graph = useMemo(
    () => buildLocalFamilyGraph(familyCode.trim(), graphOptions),
    [familyCode, graphOptions, dataRevision],
  );

  const focalMetaLine = useMemo(() => {
    if (!focal) return "";
    const born = formatDisplayDate(focal.birthDate ?? undefined);
    const parts = [formatGender(focal.gender)];
    if (born) parts.push(`Born ${born}`);
    if (focal.currentCity?.trim()) parts.push(focal.currentCity.trim());
    return parts.join(" · ");
  }, [focal]);

  const loadMore = useMemo(() => {
    if (!focal || !graph) {
      return {
        canExpandTree: false,
        parents: false,
        children: false,
        siblings: false,
      };
    }
    const { allUnions } = loadKinshipDataset();
    const layoutUnions = toLayoutUnions(allUnions);
    const included = new Set(graph.nodes.map((n) => n.id));
    const ego = graph.nodes.find((n) => n.id === focal.id);
    return {
      canExpandTree: treeExpansionHasMore(
        focal.id,
        layoutUnions,
        expansion,
        included,
      ),
      parents: ego?.data.hasUnexpandedParents ?? false,
      children: ego?.data.hasUnexpandedChildren ?? false,
      siblings: focalHasUnexpandedSiblings(
        focal.id,
        included,
        allUnions,
        expansion.siblingSteps,
      ),
    };
  }, [focal, graph, expansion]);

  const resetExpansion = () => {
    setExpansion(initialTreeExpansion(seedGenerationsUp, seedGenerationsDown));
  };

  const onExpandTree = () => {
    setExpansion((prev) => stepExpandTree(prev));
  };

  const onExpandTreeMax = () => {
    if (!focal) return;
    const { allUnions } = loadKinshipDataset();
    setExpansion(expandTreeToMaximum(focal.id, toLayoutUnions(allUnions)));
  };

  if (!focal) {
    return (
      <View style={styles.empty}>
        <AppText style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          {copy.tree.notFound}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, immersive && { backgroundColor: theme.colors.background }]}>
      {view === "graph" && (
        <View style={styles.expandBlock}>
          <View style={styles.expandRow}>
            <Button
              testID="tree-expand"
              size="sm"
              disabled={!loadMore.canExpandTree}
              onPress={onExpandTree}
            >
              <ButtonText>{copy.tree.loadMore}</ButtonText>
            </Button>
            <Button
              testID="tree-expand-max"
              size="sm"
              variant="outline"
              disabled={!loadMore.canExpandTree}
              onPress={onExpandTreeMax}
            >
              <ButtonText>{copy.tree.expandTreeMax}</ButtonText>
            </Button>
          </View>
          <View style={styles.expandRow}>
            <Button
              testID="tree-load-parents"
              size="sm"
              variant="ghost"
              disabled={!loadMore.parents}
              onPress={() =>
                setExpansion((prev) => ({
                  ...prev,
                  generationsUp: prev.generationsUp + 1,
                }))
              }
            >
              <ButtonText>{copy.tree.loadParents}</ButtonText>
            </Button>
            <Button
              testID="tree-load-siblings"
              size="sm"
              variant="ghost"
              disabled={!loadMore.siblings}
              onPress={() =>
                setExpansion((prev) => ({
                  ...prev,
                  siblingSteps: prev.siblingSteps + 1,
                }))
              }
            >
              <ButtonText>{copy.tree.loadSiblings}</ButtonText>
            </Button>
            <Button
              testID="tree-load-children"
              size="sm"
              variant="ghost"
              disabled={!loadMore.children}
              onPress={() =>
                setExpansion((prev) => ({
                  ...prev,
                  generationsDown: prev.generationsDown + 1,
                }))
              }
            >
              <ButtonText>{copy.tree.loadChildren}</ButtonText>
            </Button>
          </View>
        </View>
      )}
      {view === "graph" && graph ? (
        <GraphWebView
          key={`${dataRevision}-${graph.focalPersonId}-${graph.nodes.length}-${expansion.generationsUp}-${expansion.generationsDown}-${expansion.siblingSteps}-${expansion.cousinDegree}`}
          graph={graph}
          testID="local-tree-graph-webview"
          onPersonPress={onPersonPress}
          onPersonLongPress={onPersonLongPress}
          pathHighlightPersonIds={pathHighlightPersonIds}
          highlightPersonIds={highlightPersonIds}
        />
      ) : (
        <ScrollView
          style={[styles.scroll, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={[
            styles.content,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            className="rounded-2xl border-2 border-primary bg-card p-4 active:opacity-95"
            onPress={() =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId: focal.id, code: focal.familyCode },
              })
            }
          >
            <AppText variant="titleLarge" className="text-foreground font-semibold">
              {focal.firstName} {focal.lastName}
            </AppText>
            <AppText variant="labelSmall" className="text-muted-foreground mt-1">
              {memberRecordSubtitle(focal)}
            </AppText>
            {focalMetaLine ? (
              <AppText variant="bodySmall" className="text-muted-foreground mt-2">
                {focalMetaLine}
              </AppText>
            ) : null}
            <AppText variant="labelMedium" className="text-primary mt-3">
              {copy.tree.tapProfile}
            </AppText>
          </Pressable>

          <AppText variant="titleSmall" className="text-foreground font-semibold mt-5 mb-2">
            {copy.tree.marriagesSection}
          </AppText>
          {marriages.length === 0 ? (
            <AppText variant="bodySmall" className="text-muted-foreground">
              {copy.tree.noMarriages}
            </AppText>
          ) : (
            marriages.map((m) => (
              <View
                key={m.id}
                className="rounded-xl border border-border bg-card p-4 mt-2"
                style={{ opacity: m.isActive ? 1 : 0.75 }}
              >
                <AppText variant="labelSmall" className="text-muted-foreground uppercase">
                  {m.isActive ? copy.profile.currentMarriage : copy.profile.previousMarriage}
                </AppText>
                <AppText variant="titleSmall" className="text-foreground mt-1">
                  {copy.tree.marriageTo(m.partner1Name, m.partner2Name)}
                </AppText>
                {m.children.length === 0 ? (
                  <AppText variant="bodySmall" className="text-muted-foreground mt-2">
                    {copy.tree.noChildrenInMarriage}
                  </AppText>
                ) : (
                  m.children.map((c) => (
                    <Pressable
                      key={c.id}
                      className="mt-2 py-1 active:opacity-80"
                      onPress={() => {
                        if (onRecenterOnFamilyCode) {
                          onRecenterOnFamilyCode(c.familyCode);
                          return;
                        }
                        router.push({
                          pathname: "/member/[personId]",
                          params: { personId: c.id, code: c.familyCode },
                        });
                      }}
                    >
                      <AppText variant="bodyMedium" className="text-primary">
                        {c.name}
                      </AppText>
                    </Pressable>
                  ))
                )}
              </View>
            ))
          )}
          <AppText variant="bodySmall" className="text-muted-foreground mt-5">
            {copy.tree.privateFooter}
          </AppText>
        </ScrollView>
      )}
      {!immersive && (
        <Button variant="ghost" onPress={resetExpansion}>
          <ButtonText>{copy.tree.resetTreeView}</ButtonText>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  expandBlock: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 4,
  },
  expandRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  empty: { flex: 1, padding: 20, justifyContent: "center" },
});
