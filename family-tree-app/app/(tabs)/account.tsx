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
  useTheme,
} from "react-native-paper";

import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
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
  const theme = useTheme();
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
      showInfo(copy.storage.switchToCloudHint);
      return;
    }
    setSubmitting(true);
    try {
      const err = await auth.signIn(email.trim(), password);
      if (err) showError(err);
      else showSuccess(copy.success.signedIn);
    } finally {
      setSubmitting(false);
    }
  };

  const setMode = async (mode: StorageMode) => {
    await storage.setMode(mode);
    showInfo(
      mode === "local" ? copy.storage.switchToPrivateInfo : copy.storage.switchToCloudInfo,
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
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        App v{APP_VERSION}
      </Text>

      {storage.mode === "local" && localAccount.session && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">{copy.account.householdProfile}</Text>
            <Text variant="bodyLarge">{localAccount.session.displayName}</Text>
            <Text variant="bodySmall">{localAccount.session.email}</Text>
            <Text variant="labelSmall">
              {copy.account.memberReference}: {localAccount.session.focalFamilyCode}
            </Text>
            <Button mode="outlined" onPress={() => void localAccount.signOut()}>
              {copy.account.signOutDevice}
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">{copy.storage.whereRecordsKept}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
            {copy.storage.privateHelp}
          </Text>
          <SegmentedButtons
            value={storage.mode}
            onValueChange={(v) => void setMode(v as StorageMode)}
            buttons={[
              { value: "local", label: copy.storage.privateArchiveShort, icon: "home-heart" },
              { value: "online", label: copy.storage.familyCloudShort, icon: "cloud" },
            ]}
          />
          <Text variant="bodySmall">{copy.storage.memberCountLabel(storage.localMemberCount)}</Text>
          {storage.mode === "local" && (
            <Button
              mode="outlined"
              icon="seed"
              onPress={() => {
                const code = seedLocalDemoFamily();
                storage.bumpDataRevision();
                showSuccess(copy.account.loadSampleSuccess(code));
              }}
            >
              {copy.account.loadSampleFamily}
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">{copy.account.connectionAddress}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
            {copy.account.connectionAddressHelp}
          </Text>
          <TextInput
            mode="outlined"
            label={copy.account.connectionAddress}
            value={apiDraft}
            onChangeText={setApiDraft}
            autoCapitalize="none"
          />
          <Button mode="contained-tonal" onPress={() => void storage.setApiUrl(apiDraft)}>
            {copy.account.saveConnection}
          </Button>
        </Card.Content>
      </Card>

      {storage.mode === "online" && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">{copy.account.familyCloudSignIn}</Text>
            {auth.token ? (
              <>
                <Text variant="titleSmall">{copy.account.signedIn}</Text>
                {auth.displayName && <Text>{auth.displayName}</Text>}
                {auth.role && <Text variant="labelMedium">{auth.role}</Text>}
                <Button mode="outlined" textColor="#b91c1c" onPress={() => void auth.signOut()}>
                  {copy.account.signOut}
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
      <Text variant="bodySmall" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
        {APP_OWNER} · {APP_OWNER_EMAIL}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, marginBottom: 12 },
  gap: { gap: 10 },
  divider: { marginVertical: 12 },
});
