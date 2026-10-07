import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DemoArchiveBanner } from "@/components/archive/DemoArchiveBanner";
import { markLiveTreeChecklistOpened } from "@/lib/archive/liveChecklistStorage";
import { GraphWebView } from "@/components/tree/GraphWebView";
import { LocalFamilyTree } from "@/components/LocalFamilyTree";
import { PersonTreeSheet } from "@/components/tree/PersonTreeSheet";
import { TreeGraphExpandBar } from "@/components/tree/TreeGraphExpandBar";
import { TreeOverflowMenu } from "@/components/tree/TreeOverflowMenu";
import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { copy } from "@/content/businessCopy";
import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";
import { getLocalMemberById } from "@/lib/db/localRepository.ext";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { generationsToIncludeKinshipPath } from "../../../shared/genealogy/kinshipPathFraming";
import {
  DEFAULT_TREE_EXPANSION,
  MAX_TREE_GENERATIONS,
  MAX_COUSIN_DEGREE,
  MAX_TREE_SIBLING_STEPS,
  stepExpandTree,
} from "../../../shared/genealogy/treeExpansion";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { fetchFamilyGraph, type MobileFamilyGraph } from "@/lib/api";
import {
  resolveCloudFocalFamilyCode,
  resolveLocalFocalFamilyCode,
  resolveLocalTreeViewFamilyCode,
  saveCloudFocalFamilyCode,
  saveLocalTreeViewFamilyCode,
} from "@/lib/tree/focalFamilyCode";
import type { FamilyGraph } from "@/lib/graph/types";
import type { GraphPersonSummary } from "@/lib/graph/types";
import { TreeFocalSearchHeader } from "@/components/tree/TreeFocalSearchHeader";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { Spinner } from "@/components/ui/spinner";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";
import {
  dismissTreeTapHint,
  loadTreeTapHintDismissed,
} from "@/lib/tree/treeTapHintStorage";

function mapOnlineGraph(g: MobileFamilyGraph): FamilyGraph {
  return {
    focalPersonId: g.focalPersonId,
    focalUnionId: g.focalUnionId,
    focalUnionIds: g.focalUnionIds,
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
          treeDisplayIsPrivate: n.data.person.treeDisplayIsPrivate,
        },
        isFocal: n.data.isFocal,
        isDeceased: !n.data.person.isLiving,
        hasUnexpandedParents: n.data.hasUnexpandedParents,
        hasUnexpandedChildren: n.data.hasUnexpandedChildren,
        hasUnexpandedSiblings: n.data.hasUnexpandedSiblings,
      },
    })),
    edges: g.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      label: e.label,
    })),
  };
}

export default function TreeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { mode, apiUrl, dataRevision, setMode, archiveLane } = useStorage();
  const localAccount = useLocalAccount();
  const params = useLocalSearchParams<{
    familyCode?: string;
    highlightA?: string;
    highlightB?: string;
    pathNodes?: string;
  }>();
  const paramCode =
    typeof params.familyCode === "string" ? params.familyCode.trim() : "";
  const pathHighlightIds = useMemo(() => {
    const raw = typeof params.pathNodes === "string" ? params.pathNodes : "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [params.pathNodes]);
  const relationHighlightIds = useMemo(() => {
    const ids: string[] = [];
    if (typeof params.highlightA === "string" && params.highlightA.trim()) {
      ids.push(params.highlightA.trim());
    }
    if (typeof params.highlightB === "string" && params.highlightB.trim()) {
      ids.push(params.highlightB.trim());
    }
    return ids;
  }, [params.highlightA, params.highlightB]);
  const [loadedCode, setLoadedCode] = useState(
    paramCode || DEFAULT_FAMILY_CODE,
  );
  const pathGraphGens = useMemo(() => {
    if (pathHighlightIds.length < 2) return null;
    const focalMember = getLocalMemberByFamilyCode(loadedCode.trim());
    if (!focalMember) return null;
    const { allUnions } = loadKinshipDataset();
    return generationsToIncludeKinshipPath(
      focalMember.id,
      pathHighlightIds,
      allUnions.map((u) => ({
        partner1Id: u.partner1Id,
        partner2Id: u.partner2Id,
        childships: u.childships.map((c) => ({ childId: c.childId })),
      })),
    );
  }, [pathHighlightIds, loadedCode, dataRevision]);
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
  const [onlineExpansion, setOnlineExpansion] = useState(DEFAULT_TREE_EXPANSION);
  const [listLayout, setListLayout] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  const uri = useMemo(() => {
    return `${apiUrl}/tree/${encodeURIComponent(loadedCode)}?embed=1`;
  }, [apiUrl, loadedCode]);

  const isLocal = mode === "local";

  const loadOnlineGraph = useCallback(() => {
    if (isLocal) return;
    setGraphLoading(true);
    setUseWebFallback(false);
    setOffline(false);
    void fetchFamilyGraph(loadedCode.trim(), {
      depth: Math.max(
        onlineExpansion.generationsUp,
        onlineExpansion.generationsDown,
      ),
      siblingSteps: onlineExpansion.siblingSteps,
      cousinDegree: onlineExpansion.cousinDegree,
    })
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
  }, [isLocal, loadedCode, onlineExpansion]);

  useEffect(() => {
    loadOnlineGraph();
  }, [loadOnlineGraph, dataRevision, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (paramCode) {
        if (!cancelled) {
          setLoadedCode(paramCode);
          if (isLocal) await saveLocalTreeViewFamilyCode(archiveLane, paramCode);
        }
        return;
      }
      if (typeof params.highlightA === "string" && params.highlightA.trim()) {
        const member = getLocalMemberById(params.highlightA.trim());
        if (member?.familyCode) {
          if (!cancelled) {
            setLoadedCode(member.familyCode);
            if (isLocal) {
              await saveLocalTreeViewFamilyCode(archiveLane, member.familyCode);
            }
          }
          return;
        }
      }
      const focal =
        mode === "local"
          ? await resolveLocalTreeViewFamilyCode(
              archiveLane,
              localAccount.session?.focalFamilyCode,
            )
          : await resolveCloudFocalFamilyCode(localAccount.session?.focalFamilyCode);
      if (!cancelled) setLoadedCode(focal);
    })();
    return () => {
      cancelled = true;
    };
  }, [paramCode, params.highlightA, mode, isLocal, localAccount.session?.focalFamilyCode, archiveLane]);

  useEffect(() => {
    if (!isLocal) return;
    let cancelled = false;
    void (async () => {
      const code = await resolveLocalTreeViewFamilyCode(
        archiveLane,
        localAccount.session?.focalFamilyCode,
      );
      if (!cancelled) {
        setLoadedCode(code);
        setReloadKey((k) => k + 1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [archiveLane, isLocal]);

  useEffect(() => {
    if (isLocal && archiveLane === "live") {
      void markLiveTreeChecklistOpened();
    }
  }, [isLocal, archiveLane]);

  useEffect(() => {
    const trimmed = loadedCode.trim();
    if (!trimmed) return;
    if (isLocal) {
      void saveLocalTreeViewFamilyCode(archiveLane, trimmed);
      return;
    }
    void saveCloudFocalFamilyCode(trimmed);
  }, [isLocal, archiveLane, loadedCode]);

  const applyViewFocalByCode = useCallback(
    (familyCode: string) => {
      const code = familyCode.trim();
      if (!code) return;
      setLoadedCode(code);
      if (isLocal) void saveLocalTreeViewFamilyCode(archiveLane, code);
      setReloadKey((k) => k + 1);
    },
    [archiveLane, isLocal],
  );

  const applyViewFocal = useCallback(
    (person: GraphPersonSummary) => {
      applyViewFocalByCode(person.familyCode);
    },
    [applyViewFocalByCode],
  );

  useEffect(() => {
    if (!isLocal) return;
    void loadTreeTapHintDismissed().then((dismissed) => {
      setShowTapHint(!dismissed);
    });
  }, [isLocal]);

  const onPersonPress = (person: GraphPersonSummary) => {
    applyViewFocal(person);
  };

  const onPersonLongPress = (person: GraphPersonSummary) => {
    setSelectedPerson(person);
    setSheetOpen(true);
  };

  const centerOnPerson = () => {
    if (!selectedPerson) return;
    applyViewFocal(selectedPerson);
    setSheetOpen(false);
  };

  const onlineFocal = onlineGraph?.nodes.find(
    (n) => n.id === onlineGraph.focalPersonId,
  )?.data;

  const treeHeaderTitle = useMemo(() => {
    const trimmed = loadedCode.trim();
    if (isLocal) {
      const member = getLocalMemberByFamilyCode(trimmed);
      if (member) return `${member.firstName} ${member.lastName}`;
    } else if (onlineGraph) {
      const person = onlineGraph.nodes.find((n) => n.id === onlineGraph.focalPersonId)?.data
        .person;
      if (person) return `${person.firstName} ${person.lastName}`;
    }
    return copy.tree.title;
  }, [loadedCode, isLocal, onlineGraph]);

  const treeHeaderUrdu = useMemo(() => {
    if (!isLocal) return null;
    const member = getLocalMemberByFamilyCode(loadedCode.trim());
    if (!member) return null;
    const parts = [member.urduFirstName, member.urduLastName].filter(Boolean);
    return parts.join(" ").trim() || null;
  }, [loadedCode, isLocal]);

  const centerOnMyMarriage = () => {
    void (async () => {
      const code =
        mode === "local"
          ? resolveLocalFocalFamilyCode(localAccount.session?.focalFamilyCode)
          : await resolveCloudFocalFamilyCode(localAccount.session?.focalFamilyCode);
      setLoadedCode(code);
      setMenuOpen(false);
      setReloadKey((k) => k + 1);
    })();
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <TreeFocalSearchHeader
        style={{ backgroundColor: theme.colors.surface }}
        titleEn={treeHeaderTitle}
        titleUr={treeHeaderUrdu}
        searchEnabled={isLocal}
        onOpenMenu={() => setMenuOpen(true)}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.55, z - 0.2))}
        onSelectFamilyCode={(code) => {
          applyViewFocalByCode(code);
          setListLayout(false);
        }}
      />

      {!isLocal && offline && (
        <View className="px-3 py-2 gap-2">
          <InfoBanner icon="cloud-off-outline">{copy.tree.offlineBanner}</InfoBanner>
          <View className="flex-row gap-2">
            <AppText
              variant="labelLarge"
              className="text-primary"
              onPress={() => loadOnlineGraph()}
            >
              {copy.tree.retryLoad}
            </AppText>
            <AppText
              variant="labelLarge"
              className="text-primary"
              onPress={() => void setMode("local")}
            >
              {copy.storage.privateArchiveShort}
            </AppText>
          </View>
        </View>
      )}

      {isLocal && archiveLane === "demo" && (
        <DemoArchiveBanner testID="tree-demo-banner" />
      )}

      {isLocal && showTapHint && (
        <View className="px-3 py-2 gap-2">
          <InfoBanner icon="gesture-tap">{copy.tree.tapToCenterHint}</InfoBanner>
          <AppText
            variant="labelLarge"
            className="text-primary"
            onPress={() => {
              void dismissTreeTapHint();
              setShowTapHint(false);
            }}
          >
            {copy.tree.tapHintDismiss}
          </AppText>
        </View>
      )}

      <View style={styles.canvas}>
        {isLocal ? (
          <LocalFamilyTree
            key={`${loadedCode}-${dataRevision}-${reloadKey}-${listLayout ? "list" : "graph"}-${pathHighlightIds.join("-")}`}
            familyCode={loadedCode.trim()}
            dataRevision={dataRevision}
            immersive
            layout={listLayout ? "list" : "graph"}
            onPersonPress={onPersonPress}
            onPersonLongPress={onPersonLongPress}
            onRecenterOnFamilyCode={(code) => {
              applyViewFocalByCode(code);
              setListLayout(false);
            }}
            zoomScale={zoom}
            onZoomChange={setZoom}
            pathHighlightPersonIds={
              pathHighlightIds.length >= 2 ? pathHighlightIds : undefined
            }
            highlightPersonIds={
              relationHighlightIds.length ? relationHighlightIds : undefined
            }
            ensurePersonIds={pathHighlightIds.length ? pathHighlightIds : undefined}
            seedGenerationsUp={pathGraphGens?.generationsUp}
            seedGenerationsDown={pathGraphGens?.generationsDown}
          />
        ) : graphLoading ? (
          <View style={styles.loading}>
            <Spinner size="large" />
          </View>
        ) : onlineGraph && !useWebFallback ? (
          <>
            <TreeGraphExpandBar
              canExpandTree={
                !!onlineFocal?.hasUnexpandedParents ||
                !!onlineFocal?.hasUnexpandedChildren ||
                !!onlineFocal?.hasUnexpandedSiblings
              }
              canLoadParents={!!onlineFocal?.hasUnexpandedParents}
              canLoadChildren={!!onlineFocal?.hasUnexpandedChildren}
              canLoadSiblings={!!onlineFocal?.hasUnexpandedSiblings}
              onExpandTree={() =>
                setOnlineExpansion((prev) => stepExpandTree(prev))
              }
              onExpandTreeMax={() =>
                setOnlineExpansion({
                  generationsUp: MAX_TREE_GENERATIONS,
                  generationsDown: MAX_TREE_GENERATIONS,
                  siblingSteps: MAX_TREE_SIBLING_STEPS,
                  cousinDegree: MAX_COUSIN_DEGREE,
                })
              }
              onLoadParents={() =>
                setOnlineExpansion((prev) => ({
                  ...prev,
                  generationsUp: prev.generationsUp + 1,
                }))
              }
              onLoadSiblings={() =>
                setOnlineExpansion((prev) => ({
                  ...prev,
                  siblingSteps: prev.siblingSteps + 1,
                }))
              }
              onLoadChildren={() =>
                setOnlineExpansion((prev) => ({
                  ...prev,
                  generationsDown: prev.generationsDown + 1,
                }))
              }
            />
            <GraphWebView
              graph={onlineGraph}
              onPersonPress={onPersonPress}
              onPersonLongPress={onPersonLongPress}
              testID="online-tree-graph-webview"
              pathHighlightPersonIds={
                pathHighlightIds.length >= 2 ? pathHighlightIds : undefined
              }
              highlightPersonIds={
                relationHighlightIds.length ? relationHighlightIds : undefined
              }
            />
          </>
        ) : (
          <WebView
            source={{ uri }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <Spinner size="large" />
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
        isLocal={isLocal}
        onDismiss={() => setSheetOpen(false)}
        onCenterTree={centerOnPerson}
        onFamilyChanged={() => {
          setReloadKey((k) => k + 1);
        }}
      />
      <TreeOverflowMenu
        visible={menuOpen}
        familyCode={loadedCode}
        focalFamilyCode={
          localAccount.session?.focalFamilyCode ??
          (mode === "local" ? loadedCode : undefined)
        }
        onDismiss={() => setMenuOpen(false)}
        onCenterMarriage={centerOnMyMarriage}
        onReload={() => {
          setMenuOpen(false);
          setReloadKey((k) => k + 1);
        }}
        listLayout={isLocal ? listLayout : undefined}
        onToggleListLayout={
          isLocal
            ? () => {
                setListLayout((v) => !v);
                setMenuOpen(false);
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  canvas: { flex: 1, minHeight: 0 },
  webview: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
