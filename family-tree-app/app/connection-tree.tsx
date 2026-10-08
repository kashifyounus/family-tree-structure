import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GraphWebView } from "@/components/tree/GraphWebView";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { copy } from "@/content/businessCopy";
import { buildConnectionPathGraph } from "@/lib/graph/buildConnectionPathGraph";
import type { PathLayoutStep } from "../../shared/genealogy/pathTimelineLayout";
import { useAppTheme } from "@/theme/useAppTheme";

export default function ConnectionTreeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    personA?: string;
    personB?: string;
    pathSteps?: string;
    summary?: string;
  }>();

  const personA = typeof params.personA === "string" ? params.personA : "";
  const personB = typeof params.personB === "string" ? params.personB : "";
  const summary =
    typeof params.summary === "string" ? params.summary : "";

  const steps = useMemo((): PathLayoutStep[] => {
    const raw = typeof params.pathSteps === "string" ? params.pathSteps : "";
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as PathLayoutStep[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params.pathSteps]);

  const graph = useMemo(() => {
    if (!personA || !personB || personA === personB) return null;
    return buildConnectionPathGraph(personA, personB, steps);
  }, [personA, personB, steps]);

  const pathIds = useMemo(() => {
    const ids = new Set<string>([personA, personB]);
    for (const s of steps) {
      ids.add(s.fromId);
      ids.add(s.toId);
    }
    return [...ids];
  }, [personA, personB, steps]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={[styles.bar, { backgroundColor: theme.colors.surface }]}>
          <IconButton
            icon="arrow-left"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          />
          <View style={styles.barText}>
            <AppText variant="titleSmall" numberOfLines={1}>
              {copy.tools.connectionTreeTitle}
            </AppText>
            {summary ? (
              <AppText
                variant="labelSmall"
                numberOfLines={2}
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {summary}
              </AppText>
            ) : null}
          </View>
        </View>
        {graph && graph.nodes.length > 0 ? (
          <GraphWebView
            graph={graph}
            fitMode="timeline"
            edgeToEdge
            pathHighlightPersonIds={pathIds}
            highlightPersonIds={[personA, personB]}
            testID="connection-tree-graph"
          />
        ) : (
          <View style={styles.empty}>
            <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {copy.tools.connectionTreeEmpty}
            </AppText>
          </View>
        )}
        <AppText
          variant="labelSmall"
          style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
        >
          {copy.tools.connectionTreeHint}
        </AppText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    paddingVertical: 4,
  },
  barText: { flex: 1, marginLeft: 4, marginRight: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  hint: {
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
