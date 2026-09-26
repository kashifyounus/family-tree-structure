import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const theme = useAppTheme();
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

  const focalMetaLine = useMemo(() => {
    if (!focal) return "";
    const born = formatDisplayDate(focal.birthDate ?? undefined);
    const parts = [formatGender(focal.gender)];
    if (born) parts.push(`Born ${born}`);
    if (focal.currentCity?.trim()) parts.push(focal.currentCity.trim());
    return parts.join(" · ");
  }, [focal]);

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
        <AppText style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
          {copy.tree.notFound}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, immersive && { backgroundColor: theme.colors.background }]}>
      {view === "graph" && (
        <View style={styles.expandRow}>
          <Button
            size="sm"
            variant="outline"
            disabled={!more.parents}
            onPress={() => setGensUp((g) => g + 1)}
          >
            <ButtonText>{copy.tree.loadParents}</ButtonText>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!more.siblings}
            onPress={() => setSiblingSteps((s) => s + 1)}
          >
            <ButtonText>{copy.tree.loadSiblings}</ButtonText>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!more.children}
            onPress={() => setGensDown((g) => g + 1)}
          >
            <ButtonText>{copy.tree.loadChildren}</ButtonText>
          </Button>
        </View>
      )}
      {view === "graph" && graph ? (
        <GraphWebView
          graph={graph}
          testID="local-tree-graph-webview"
          onPersonPress={onPersonPress}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
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
                      onPress={() =>
                        router.push({
                          pathname: "/member/[personId]",
                          params: { personId: c.id, code: c.familyCode },
                        })
                      }
                    >
                      <AppText variant="bodyMedium" className="text-primary">
                        {copy.tree.childLine(c.name, c.familyCode)}
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
          <ButtonText>{copy.tree.menuReload}</ButtonText>
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
  content: { padding: 16, paddingBottom: 32 },
  empty: { flex: 1, padding: 20, justifyContent: "center" },
});
