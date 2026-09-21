import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalFamilyTree } from "@/components/LocalFamilyTree";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";

export default function TreeScreen() {
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

  const uri = useMemo(() => {
    return `${apiUrl}/tree/${encodeURIComponent(loadedCode)}?embed=1`;
  }, [apiUrl, loadedCode]);

  const isLocal = mode === "local";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text variant="labelLarge" style={styles.title}>
          Family tree
        </Text>
        <IconButton
          icon={toolbarOpen ? "chevron-up" : "tune"}
          onPress={() => setToolbarOpen((v) => !v)}
          accessibilityLabel="Tree options"
        />
      </View>
      {toolbarOpen && (
        <View style={styles.toolbar}>
          <Text variant="labelSmall">
            {isLocal ? "Local SQLite" : "Online graph"}
          </Text>
          <Text variant="bodySmall" style={styles.code}>
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
  root: { flex: 1, backgroundColor: "#0f172a" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#1e293b",
  },
  title: { color: "#e2e8f0", marginLeft: 8 },
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#1e293b",
    gap: 4,
  },
  code: { color: "#94a3b8", fontFamily: "SpaceMono" },
  canvas: { flex: 1, minHeight: 0 },
  webview: { flex: 1, backgroundColor: "#f8fafc" },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});
