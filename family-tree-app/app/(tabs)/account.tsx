import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";

import { Screen } from "@/components/ui/Screen";
import {
  APP_OWNER,
  APP_OWNER_EMAIL,
  APP_VERSION,
} from "@/constants/appMeta";
import { useAppFeedback } from "@/context/ErrorContext";
import {
  DEFAULT_LOGIN_EMAIL,
  DEFAULT_LOGIN_PASSWORD,
  useAuth,
} from "@/context/AuthContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { seedLocalDemoFamily } from "@/lib/db/seedLocalDemo";
import type { StorageMode } from "@/lib/data/types";

export default function AccountScreen() {
  const auth = useAuth();
  const localAccount = useLocalAccount();
  const storage = useStorage();
  const { showError, showSuccess, showInfo } = useAppFeedback();
  const [email, setEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [apiDraft, setApiDraft] = useState(storage.apiUrl);

  const onSignIn = async () => {
    if (storage.mode !== "online") {
      showInfo("Switch data source to Online to sign in against the server.");
      return;
    }
    setSubmitting(true);
    try {
      const err = await auth.signIn(email.trim(), password);
      if (err) showError(err);
      else showSuccess("Signed in to server");
    } finally {
      setSubmitting(false);
    }
  };

  const setMode = async (mode: StorageMode) => {
    await storage.setMode(mode);
    showInfo(
      mode === "local"
        ? "Local SQLite — data stays on this device. You can still connect the API below."
        : "Online API — shared family data via your server.",
    );
  };

  if (!storage.ready || auth.loading || localAccount.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen testID="account-screen">
      <Text variant="bodySmall" style={styles.version}>App v{APP_VERSION}</Text>

      {storage.mode === "local" && localAccount.session && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">Local account</Text>
            <Text variant="bodyLarge">{localAccount.session.displayName}</Text>
            <Text variant="bodySmall">{localAccount.session.email}</Text>
            <Text variant="labelSmall">Focal code: {localAccount.session.focalFamilyCode}</Text>
            <Button mode="outlined" onPress={() => void localAccount.signOut()}>
              Sign out (local)
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Data source</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Start with SQLite on device, then connect your API anytime without losing
            local records.
          </Text>
          <SegmentedButtons
            value={storage.mode}
            onValueChange={(v) => void setMode(v as StorageMode)}
            buttons={[
              { value: "local", label: "SQLite", icon: "database" },
              { value: "online", label: "API", icon: "cloud" },
            ]}
          />
          <Text variant="bodySmall">Local records: {storage.localMemberCount}</Text>
          {storage.mode === "local" && (
            <Button
              mode="outlined"
              icon="seed"
              onPress={() => {
                const code = seedLocalDemoFamily();
                storage.bumpDataRevision();
                showSuccess(`Demo loaded — ${code}`);
              }}
            >
              Load demo family
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Server API (optional)</Text>
          <TextInput
            mode="outlined"
            label="API base URL"
            value={apiDraft}
            onChangeText={setApiDraft}
            autoCapitalize="none"
          />
          <Button mode="contained-tonal" onPress={() => void storage.setApiUrl(apiDraft)}>
            Save API URL
          </Button>
          <Text variant="labelSmall" style={styles.mono}>{storage.apiUrl}</Text>
        </Card.Content>
      </Card>

      {storage.mode === "online" && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">Server sign-in</Text>
            {auth.token ? (
              <>
                <Text variant="titleSmall">Signed in</Text>
                {auth.displayName && <Text>{auth.displayName}</Text>}
                {auth.role && <Text variant="labelMedium">{auth.role}</Text>}
                <Button mode="outlined" textColor="#b91c1c" onPress={() => void auth.signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  mode="outlined"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <TextInput
                  mode="outlined"
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Button mode="contained" loading={submitting} onPress={() => void onSignIn()}>
                  Sign in
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      <Divider style={styles.divider} />
      <Text variant="bodySmall" style={styles.footer}>
        {APP_OWNER} · {APP_OWNER_EMAIL}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  version: { color: "#64748b", marginBottom: 8 },
  card: { borderRadius: 16, marginBottom: 12 },
  gap: { gap: 10 },
  muted: { color: "#64748b", lineHeight: 20 },
  mono: { fontFamily: "SpaceMono" },
  divider: { marginVertical: 12 },
  footer: { textAlign: "center", color: "#64748b", marginBottom: 24 },
});
