import { useState } from "react";
import {
  ActivityIndicator,
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
import { getApiBaseUrl } from "@/lib/api";

export default function AccountScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSignIn = async () => {
    setSubmitting(true);
    setError(null);
    const err = await auth.signIn(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  };

  if (auth.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.version}>App v{APP_VERSION}</Text>
      <Text style={styles.api}>API: {getApiBaseUrl()}</Text>

      {auth.token ? (
        <View style={styles.card}>
          <Text style={styles.signedIn}>Signed in</Text>
          {auth.displayName && (
            <Text style={styles.name}>{auth.displayName}</Text>
          )}
          {auth.role && <Text style={styles.role}>{auth.role}</Text>}
          <Pressable style={styles.outBtn} onPress={() => void auth.signOut()}>
            <Text style={styles.outBtnText}>Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
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
  api: { fontSize: 11, color: "#a1a1aa", fontFamily: "SpaceMono" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    gap: 8,
  },
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
