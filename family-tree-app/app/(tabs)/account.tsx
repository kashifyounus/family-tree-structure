import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { AppDialogForm } from "@/components/ui/AppDialogForm";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { Screen } from "@/components/ui/Screen";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { copy } from "@/content/businessCopy";
import { CreditFooter } from "@/components/CreditFooter";
import { APP_NAME } from "@/constants/appMeta";
import { useAppFeedback } from "@/context/ErrorContext";
import {
  DEFAULT_LOGIN_EMAIL,
  DEFAULT_LOGIN_PASSWORD,
  useAuth,
} from "@/context/AuthContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import {
  countFixturePeople,
  seedComprehensiveFixture,
  wipeFixtureDataset,
} from "@/lib/db/comprehensiveSeed";
import type { StorageMode } from "@/lib/data/types";
import { normalizeApiBaseUrl, probeMobileApiHealth } from "@/lib/apiUrl";

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const prefs = useAppPreferences();
  const auth = useAuth();
  const localAccount = useLocalAccount();
  const storage = useStorage();
  const { showError, showSuccess, showInfo } = useAppFeedback();
  const [email, setEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [apiDraft, setApiDraft] = useState(storage.apiUrl);
  const [testingConnection, setTestingConnection] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirmDraft, setPinConfirmDraft] = useState("");
  const [pinFieldError, setPinFieldError] = useState<string | undefined>();
  const [pinConfirmError, setPinConfirmError] = useState<string | undefined>();
  const [fixtureBusy, setFixtureBusy] = useState(false);

  useEffect(() => {
    setApiDraft(storage.apiUrl);
  }, [storage.apiUrl]);

  const onSaveConnection = async () => {
    try {
      const normalized = normalizeApiBaseUrl(apiDraft);
      const changed = normalized !== storage.apiUrl;
      await storage.setApiUrl(apiDraft);
      if (changed) {
        storage.bumpDataRevision();
        if (auth.token) {
          await auth.signOut();
          showInfo(copy.account.connectionChangedSignInAgain);
        } else {
          showSuccess(copy.account.connectionSaved);
        }
      } else {
        showSuccess(copy.account.connectionSaved);
      }
    } catch (e) {
      showError(e);
    }
  };

  const onTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await probeMobileApiHealth(apiDraft);
      if (result.ok) showSuccess(copy.account.connectionTestOk);
      else showError(new Error(result.message));
    } finally {
      setTestingConnection(false);
    }
  };

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
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>
        {APP_NAME}
      </Text>
      <CreditFooter />

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
          <Text variant="titleMedium">{copy.account.appearanceTitle}</Text>
          <SegmentedButtons
            value={prefs.theme}
            onValueChange={(v) => void prefs.setTheme(v as "light" | "dark")}
            buttons={[
              { value: "light", label: copy.account.themeLight, icon: "white-balance-sunny" },
              { value: "dark", label: copy.account.themeDark, icon: "moon-waning-crescent" },
            ]}
          />
          <Text variant="titleSmall">{copy.account.textSizeTitle}</Text>
          <SegmentedButtons
            value={prefs.textScale}
            onValueChange={(v) => void prefs.setTextScale(v as "normal" | "large")}
            buttons={[
              { value: "normal", label: copy.account.textNormal },
              { value: "large", label: copy.account.textLarge },
            ]}
          />
          <View style={styles.rowBetween}>
            <Text variant="bodyMedium">{copy.account.hapticsTitle}</Text>
            <Switch
              value={prefs.hapticsEnabled}
              onValueChange={(v) => void prefs.setHapticsEnabled(v)}
            />
          </View>
          <Text variant="titleSmall">{copy.security.pinTitle}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {copy.security.pinHelp}
          </Text>
          {prefs.pinEnabled ? (
            <>
              <View style={styles.rowBetween}>
                <Text variant="bodyMedium">{copy.security.biometricTitle}</Text>
                <Switch
                  value={prefs.biometricUnlockEnabled}
                  onValueChange={(v) => void prefs.setBiometricUnlockEnabled(v)}
                />
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.security.biometricHelp}
              </Text>
              <Button mode="outlined" onPress={() => void prefs.clearPin().then(() => showSuccess(copy.security.pinRemoved))}>
                {copy.security.removePin}
              </Button>
            </>
          ) : (
            <Button mode="outlined" onPress={() => setPinDialogOpen(true)}>
              {copy.security.setPin}
            </Button>
          )}
        </Card.Content>
      </Card>

      <AppDialogForm
        visible={pinDialogOpen}
        title={copy.security.setPin}
        onDismiss={() => {
          setPinDialogOpen(false);
          setPinDraft("");
          setPinConfirmDraft("");
          setPinFieldError(undefined);
          setPinConfirmError(undefined);
        }}
        onSubmit={() => {
          setPinFieldError(undefined);
          setPinConfirmError(undefined);
          if (!/^\d{4,6}$/.test(pinDraft)) {
            setPinFieldError("PIN must be 4–6 digits.");
            showError(new Error(copy.errors.validation));
            return;
          }
          if (pinDraft !== pinConfirmDraft) {
            setPinConfirmError(copy.security.pinMismatch);
            showError(new Error(copy.security.pinMismatch));
            return;
          }
          void prefs
            .setPin(pinDraft)
            .then(() => {
              showSuccess(copy.security.pinSet);
              setPinDialogOpen(false);
              setPinDraft("");
              setPinConfirmDraft("");
            })
            .catch((e) => showError(e));
        }}
        submitLabel={copy.security.setPin}
        cancelLabel={copy.reports.cancel}
      >
        <FormTextInput
          label={copy.security.pinLabel}
          value={pinDraft}
          onChangeText={setPinDraft}
          errorText={pinFieldError}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
        />
        <FormTextInput
          label={copy.security.pinConfirmLabel}
          value={pinConfirmDraft}
          onChangeText={setPinConfirmDraft}
          errorText={pinConfirmError}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
        />
      </AppDialogForm>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">{copy.account.dataTitle}</Text>
          <Button
            mode="outlined"
            icon="toolbox"
            onPress={() => router.push("/(tabs)/tools")}
          >
            {copy.account.openTools}
          </Button>
        </Card.Content>
      </Card>

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
            <>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.account.sampleFixtureCount(countFixturePeople())}
              </Text>
              <Button
                mode="outlined"
                icon="seed"
                loading={fixtureBusy}
                disabled={fixtureBusy}
                onPress={() => {
                  setFixtureBusy(true);
                  try {
                    const result = seedComprehensiveFixture();
                    storage.bumpDataRevision();
                    showSuccess(copy.account.loadSampleSuccess(result.focalFamilyCode));
                  } catch (e) {
                    showError(e);
                  } finally {
                    setFixtureBusy(false);
                  }
                }}
              >
                {copy.account.loadSampleFamily}
              </Button>
              <Button
                mode="text"
                icon="delete-sweep"
                disabled={fixtureBusy || countFixturePeople() === 0}
                onPress={() => {
                  setFixtureBusy(true);
                  try {
                    const { removed } = wipeFixtureDataset();
                    storage.bumpDataRevision();
                    showSuccess(copy.account.clearSampleSuccess(removed));
                  } catch (e) {
                    showError(e);
                  } finally {
                    setFixtureBusy(false);
                  }
                }}
              >
                {copy.account.clearSampleFamily}
              </Button>
            </>
          )}
          {storage.mode === "local" && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              {copy.storage.cloudUrlWhenOnline}
            </Text>
          )}
        </Card.Content>
      </Card>

      {storage.mode === "online" && (
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">{copy.account.familyCloudSignIn}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              {copy.account.connectionAddressHelp}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              {copy.account.connectionCurrent(storage.apiUrl)}
            </Text>
            <TextInput
              testID="account-api-url"
              mode="outlined"
              label={copy.account.connectionAddress}
              value={apiDraft}
              onChangeText={setApiDraft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.rowButtons}>
              <Button
                mode="outlined"
                loading={testingConnection}
                disabled={testingConnection}
                onPress={() => void onTestConnection()}
                style={styles.flexBtn}
              >
                {copy.account.testConnection}
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => void onSaveConnection()}
                style={styles.flexBtn}
              >
                {copy.account.saveConnection}
              </Button>
            </View>
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
      <View style={{ marginBottom: 24, alignItems: "center" }}>
        <CreditFooter showVersion={false} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, marginBottom: 12 },
  gap: { gap: 10 },
  divider: { marginVertical: 12 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
  },
  flexBtn: { flex: 1 },
});
