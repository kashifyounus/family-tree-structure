import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton, Text, useTheme } from "react-native-paper";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FamilyTreeGraphView } from "@/components/FamilyTreeGraphView";
import { LocalFamilyTree } from "@/components/LocalFamilyTree";
import { copy } from "@/content/businessCopy";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { fetchFamilyGraph, type MobileFamilyGraph } from "@/lib/api";
import type { FamilyGraph } from "@/lib/graph/types";

function mapOnlineGraph(g: MobileFamilyGraph): FamilyGraph {
  return {
    focalPersonId: g.focalPersonId,
    nodes: g.nodes.map((n) => ({
      id: n.id,
      type: "person",
      position: n.position,
      data: {
        person: {
          id: n.data.person.id,
          familyCode: n.data.person.familyCode,
          firstName: n.data.person.firstName,
          lastName: n.data.person.lastName,
          gender: n.data.person.gender as FamilyGraph["nodes"][0]["data"]["person"]["gender"],
          birthDate: n.data.person.birthDate,
          deathDate: n.data.person.deathDate,
          currentCity: n.data.person.currentCity,
          isLiving: n.data.person.isLiving,
        },
        isFocal: n.data.isFocal,
        isDeceased: !n.data.person.isLiving,
      },
    })),
    edges: g.edges,
  };
}

export default function TreeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { mode, apiUrl, dataRevision } = useStorage();
  const localAccount = useLocalAccount();
  const params = useLocalSearchParams<{ familyCode?: string }>();
  const defaultCode =
    mode === "local" && localAccount.session
      ? localAccount.session.focalFamilyCode
      : "FAM-10004";
  const [loadedCode] = useState(params.familyCode ?? defaultCode);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [onlineGraph, setOnlineGraph] = useState<FamilyGraph | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [useWebFallback, setUseWebFallback] = useState(false);

  const uri = useMemo(() => {
    return `${apiUrl}/tree/${encodeURIComponent(loadedCode)}?embed=1`;
  }, [apiUrl, loadedCode]);

  const isLocal = mode === "local";

  useEffect(() => {
    if (isLocal) return;
    setGraphLoading(true);
    setUseWebFallback(false);
    void fetchFamilyGraph(loadedCode.trim())
      .then((g) => {
        if (g && g.nodes.length > 0) {
          setOnlineGraph(mapOnlineGraph(g));
        } else {
          setUseWebFallback(true);
        }
      })
      .catch(() => setUseWebFallback(true))
      .finally(() => setGraphLoading(false));
  }, [isLocal, loadedCode, dataRevision]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface }]}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
          {copy.tree.title}
        </Text>
        <IconButton
          icon={toolbarOpen ? "chevron-up" : "tune"}
          onPress={() => setToolbarOpen((v) => !v)}
          accessibilityLabel={copy.tree.options}
        />
      </View>
      {toolbarOpen && (
        <View style={[styles.toolbar, { backgroundColor: theme.colors.surface }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {isLocal ? copy.tree.privateView : copy.tree.sharedView}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary, fontFamily: "SpaceMono" }}>
            {loadedCode}
          </Text>
        </View>
      )}
      <View style={styles.canvas}>
        {isLocal ? (
          <LocalFamilyTree
            key={`${loadedCode}-${dataRevision}`}
            familyCode={loadedCode.trim()}
            immersive
          />
        ) : graphLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : onlineGraph && !useWebFallback ? (
          <FamilyTreeGraphView graph={onlineGraph} />
        ) : (
          <WebView
            source={{ uri }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" />
              </View>
            )}
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  canvas: { flex: 1, minHeight: 0 },
  webview: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
