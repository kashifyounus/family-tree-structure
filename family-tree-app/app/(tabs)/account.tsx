import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  APP_OWNER,
  APP_OWNER_EMAIL,
  APP_VERSION,
} from "@/constants/appMeta";
import {
  DEFAULT_LOGIN_EMAIL,
  DEFAULT_LOGIN_PASSWORD,
  useAuth,
} from "@/context/AuthContext";
import { useStorage } from "@/context/StorageContext";
import { seedLocalDemoFamily } from "@/lib/db/seedLocalDemo";
import type { StorageMode } from "@/lib/data/types";

export default function AccountScreen() {
  const auth = useAuth();
  const storage = useStorage();
  const [email, setEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiDraft, setApiDraft] = useState(storage.apiUrl);

  const onSignIn = async () => {
    if (storage.mode !== "online") {
      Alert.alert(
        "Online mode required",
        "Switch data source to Online to sign in against the server.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    const err = await auth.signIn(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  };

  const setMode = (mode: StorageMode) => {
    void storage.setMode(mode);
    if (mode === "local") {
      Alert.alert(
        "Local SQLite",
        "Family data will be stored only on this device. Online sign-in is not required.",
      );
    }
  };

  if (!storage.ready || auth.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.version}>App v{APP_VERSION}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data source</Text>
        <Text style={styles.help}>
          Each phone has its own SQLite file. Choose Online to use the shared
          PostgreSQL database through the web API (recommended for family-wide
          data). Direct Postgres from the phone is not used — API only.
        </Text>
        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeBtn,
              storage.mode === "local" && styles.modeBtnActive,
            ]}
            onPress={() => setMode("local")}
          >
            <Text
              style={
                storage.mode === "local" ? styles.modeBtnTextActive : undefined
              }
            >
              Local SQLite
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeBtn,
              storage.mode === "online" && styles.modeBtnActive,
            ]}
            onPress={() => setMode("online")}
          >
            <Text
              style={
                storage.mode === "online" ? styles.modeBtnTextActive : undefined
              }
            >
              Online API
            </Text>
          </Pressable>
        </View>
        <Text style={styles.stat}>
          Local records on device: {storage.localMemberCount}
        </Text>
        {storage.mode === "local" && (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              const code = seedLocalDemoFamily();
              storage.bumpDataRevision();
              Alert.alert("Demo loaded", `Sample focal member: ${code}`);
            }}
          >
            <Text style={styles.secondaryBtnText}>Load demo family (SQLite)</Text>
          </Pressable>
        )}
      </View>

      {storage.mode === "online" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>API base URL</Text>
          <TextInput
            style={styles.input}
            value={apiDraft}
            onChangeText={setApiDraft}
            autoCapitalize="none"
            placeholder="https://your-server.com"
          />
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => void storage.setApiUrl(apiDraft)}
          >
            <Text style={styles.secondaryBtnText}>Save API URL</Text>
          </Pressable>
          <Text style={styles.apiHint}>Current: {storage.apiUrl}</Text>
        </View>
      )}

      {storage.mode === "online" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Server sign-in</Text>
          {auth.token ? (
            <>
              <Text style={styles.signedIn}>Signed in</Text>
              {auth.displayName && (
                <Text style={styles.name}>{auth.displayName}</Text>
              )}
              {auth.role && <Text style={styles.role}>{auth.role}</Text>}
              <Pressable
                style={styles.outBtn}
                onPress={() => void auth.signOut()}
              >
                <Text style={styles.outBtnText}>Sign out</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Pressable
                style={styles.inBtn}
                onPress={() => void onSignIn()}
                disabled={submitting}
              >
                <Text style={styles.inBtnText}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Text>
              </Pressable>
              {error && <Text style={styles.error}>{error}</Text>}
            </>
          )}
        </View>
      )}

      <Text style={styles.footer}>
        {APP_OWNER} · {APP_OWNER_EMAIL}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fafafa", gap: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  version: { fontSize: 13, color: "#71717a" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  help: { fontSize: 12, lineHeight: 18, color: "#52525b" },
  modeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  modeBtnTextActive: { color: "#fff", fontWeight: "600" },
  stat: { fontSize: 12, color: "#71717a" },
  secondaryBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    alignItems: "center",
    backgroundColor: "#eef2ff",
  },
  secondaryBtnText: { color: "#4338ca", fontWeight: "600" },
  apiHint: { fontSize: 10, fontFamily: "SpaceMono", color: "#a1a1aa" },
  label: { fontSize: 12, color: "#71717a" },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inBtn: {
    marginTop: 8,
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  inBtnText: { color: "#fff", fontWeight: "600" },
  signedIn: { fontWeight: "700", fontSize: 16 },
  name: { fontSize: 15 },
  role: { fontSize: 12, color: "#4f46e5" },
  outBtn: {
    marginTop: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
  },
  outBtnText: { color: "#dc2626", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  footer: { marginTop: "auto", textAlign: "center", fontSize: 12, color: "#71717a" },
});
