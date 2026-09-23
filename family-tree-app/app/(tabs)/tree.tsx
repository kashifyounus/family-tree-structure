import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Banner,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FamilyTreeGraphView } from "@/components/FamilyTreeGraphView";
import { LocalFamilyTree } from "@/components/LocalFamilyTree";
import { PersonTreeSheet } from "@/components/tree/PersonTreeSheet";
import { TreeOverflowMenu } from "@/components/tree/TreeOverflowMenu";
import { copy } from "@/content/businessCopy";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { fetchFamilyGraph, type MobileFamilyGraph } from "@/lib/api";
import type { FamilyGraph } from "@/lib/graph/types";
import type { GraphPersonSummary } from "@/lib/graph/types";

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
          urduFirstName: n.data.person.urduFirstName ?? null,
          urduLastName: n.data.person.urduLastName ?? null,
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
  const { mode, apiUrl, dataRevision, setMode } = useStorage();
  const localAccount = useLocalAccount();
  const params = useLocalSearchParams<{ familyCode?: string }>();
  const defaultCode =
    mode === "local" && localAccount.session
      ? localAccount.session.focalFamilyCode
      : "FAM-10004";
  const [loadedCode, setLoadedCode] = useState(params.familyCode ?? defaultCode);
  const [menuOpen, setMenuOpen] = useState(false);
  const [onlineGraph, setOnlineGraph] = useState<FamilyGraph | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [useWebFallback, setUseWebFallback] = useState(false);
  const [offline, setOffline] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<GraphPersonSummary | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const uri = useMemo(() => {
    return `${apiUrl}/tree/${encodeURIComponent(loadedCode)}?embed=1`;
  }, [apiUrl, loadedCode]);

  const isLocal = mode === "local";

  const loadOnlineGraph = useCallback(() => {
    if (isLocal) return;
    setGraphLoading(true);
    setUseWebFallback(false);
    setOffline(false);
    void fetchFamilyGraph(loadedCode.trim())
      .then((g) => {
        if (g && g.nodes.length > 0) {
          setOnlineGraph(mapOnlineGraph(g));
        } else {
          setUseWebFallback(true);
        }
      })
      .catch(() => {
        setOffline(true);
        setUseWebFallback(true);
      })
      .finally(() => setGraphLoading(false));
  }, [isLocal, loadedCode]);

  useEffect(() => {
    loadOnlineGraph();
  }, [loadOnlineGraph, dataRevision, reloadKey]);

  useEffect(() => {
    if (params.familyCode) setLoadedCode(params.familyCode);
  }, [params.familyCode]);

  const onPersonPress = (person: GraphPersonSummary) => {
    setSelectedPerson(person);
    setSheetOpen(true);
  };

  const centerOnPerson = () => {
    if (!selectedPerson) return;
    setLoadedCode(selectedPerson.familyCode);
    setSheetOpen(false);
    setReloadKey((k) => k + 1);
  };

  const centerOnMyMarriage = () => {
    const code =
      mode === "local" && localAccount.session
        ? localAccount.session.focalFamilyCode
        : defaultCode;
    setLoadedCode(code);
    setMenuOpen(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface }]}>
        <Text
          variant="titleSmall"
          numberOfLines={1}
          style={{ color: theme.colors.onSurface, flex: 1, marginLeft: 8 }}
        >
          {copy.tree.title} · {loadedCode}
        </Text>
        <IconButton
          icon="magnify-plus-outline"
          accessibilityLabel={copy.tree.zoomIn}
          onPress={() => setZoom((z) => Math.min(2.5, z + 0.2))}
        />
        <IconButton
          icon="magnify-minus-outline"
          accessibilityLabel={copy.tree.zoomOut}
          onPress={() => setZoom((z) => Math.max(0.55, z - 0.2))}
        />
        <IconButton
          testID="tree-overflow-menu"
          icon="dots-vertical"
          accessibilityLabel={copy.tree.options}
          onPress={() => setMenuOpen(true)}
        />
      </View>

      {!isLocal && offline && (
        <Banner
          visible
          icon="cloud-off-outline"
          actions={[
            {
              label: copy.storage.privateArchiveShort,
              onPress: () => void setMode("local"),
            },
          ]}
        >
          {copy.tree.offlineBanner}
        </Banner>
      )}

      <View style={styles.canvas}>
        {isLocal ? (
          <LocalFamilyTree
            key={`${loadedCode}-${dataRevision}-${reloadKey}`}
            familyCode={loadedCode.trim()}
            immersive
            onPersonPress={onPersonPress}
            zoomScale={zoom}
            onZoomChange={setZoom}
          />
        ) : graphLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : onlineGraph && !useWebFallback ? (
          <FamilyTreeGraphView
            graph={onlineGraph}
            onPersonPress={onPersonPress}
            zoomScale={zoom}
            onZoomChange={setZoom}
          />
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

      <PersonTreeSheet
        visible={sheetOpen}
        person={selectedPerson}
        onDismiss={() => setSheetOpen(false)}
        onCenterTree={centerOnPerson}
      />
      <TreeOverflowMenu
        visible={menuOpen}
        familyCode={loadedCode}
        onDismiss={() => setMenuOpen(false)}
        onCenterMarriage={centerOnMyMarriage}
        onReload={() => {
          setMenuOpen(false);
          setReloadKey((k) => k + 1);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  canvas: { flex: 1, minHeight: 0 },
  webview: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
