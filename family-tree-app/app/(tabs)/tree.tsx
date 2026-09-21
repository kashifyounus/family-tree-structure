import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalFamilyTree } from "@/components/LocalFamilyTree";
import { DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { useStorage } from "@/context/StorageContext";

export default function TreeScreen() {
  const insets = useSafeAreaInsets();
  const { mode, apiUrl, dataRevision } = useStorage();
  const params = useLocalSearchParams<{ familyCode?: string }>();
  const [code, setCode] = useState(params.familyCode ?? DEFAULT_FAMILY_CODE);
  const [loadedCode, setLoadedCode] = useState(code);

  const uri = useMemo(() => {
    return `${apiUrl}/tree/${encodeURIComponent(loadedCode)}`;
  }, [apiUrl, loadedCode]);

  const isLocal = mode === "local";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.toolbar}>
        <Text style={styles.mode}>
          {isLocal ? "📱 Local SQLite (this device)" : "☁️ Online (PostgreSQL API)"}
        </Text>
        <Text style={styles.label}>Family code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          onSubmitEditing={() => setLoadedCode(code.trim())}
          returnKeyType="go"
        />
        <Text style={styles.hint}>
          {isLocal
            ? "Family structure stored in your on-device database."
            : "Interactive graph from the web app (pan, pinch, tap)."}
        </Text>
      </View>
      {isLocal ? (
        <LocalFamilyTree
          key={`${loadedCode}-${dataRevision}`}
          familyCode={loadedCode.trim()}
        />
      ) : (
        <WebView
          source={{ uri }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          )}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f5" },
  toolbar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  mode: { fontSize: 12, fontWeight: "600", color: "#4f46e5", marginBottom: 6 },
  label: { fontSize: 11, color: "#71717a", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
  hint: { fontSize: 11, color: "#a1a1aa", marginTop: 6 },
  webview: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },
});
