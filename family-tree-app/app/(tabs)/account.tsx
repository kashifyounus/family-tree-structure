import { useRouter } from "expo-router";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AccountFigmaSections } from "@/components/account/AccountFigmaSections";
import { AccountProfileHero } from "@/components/account/AccountProfileHero";

import { Button as GsButton, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

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
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

export default function AccountScreen() {
  const theme = useAppTheme();
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
        <Spinner size="large" />
      </View>
    );
  }

  const onSignOut = () => {
    if (localAccount.session) {
      void localAccount.signOut();
      return;
    }
    if (auth.token) {
      void auth.signOut();
    }
  };

  return (
    <Screen testID="account-screen" safeTop>
      <AccountProfileHero
        displayName={localAccount.session?.displayName}
        email={localAccount.session?.email}
      />
      <AccountFigmaSections
        privateArchiveOn={storage.mode === "local"}
        onPrivateArchiveChange={(on) => void setMode(on ? "local" : "online")}
        onSignOut={onSignOut}
      />

      <AppText variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Advanced
      </AppText>

      {storage.mode === "local" && localAccount.session && (
        <AppCard style={styles.card}>
          <AppCardContent style={styles.gap}>
            <AppText variant="titleMedium">{copy.account.householdProfile}</AppText>
            <AppText variant="bodyLarge">{localAccount.session.displayName}</AppText>
            <AppText variant="bodySmall">{localAccount.session.email}</AppText>
            <AppText variant="labelSmall">
              {copy.account.memberReference}: {localAccount.session.focalFamilyCode}
            </AppText>
            <GsButton variant="outline" onPress={() => void localAccount.signOut()}>
              <ButtonText>{copy.account.signOutDevice}</ButtonText>
            </GsButton>
          </AppCardContent>
        </AppCard>
      )}

      <AppCard style={styles.card}>
        <AppCardContent style={styles.gap}>
          <AppText variant="titleMedium">{copy.account.appearanceTitle}</AppText>
          <SegmentedControl
            value={prefs.theme}
            onChange={(v) => void prefs.setTheme(v)}
            options={[
              { value: "light", label: copy.account.themeLight },
              { value: "dark", label: copy.account.themeDark },
            ]}
          />
          <AppText variant="titleSmall">{copy.account.textSizeTitle}</AppText>
          <SegmentedControl
            value={prefs.textScale}
            onChange={(v) => void prefs.setTextScale(v)}
            options={[
              { value: "normal", label: copy.account.textNormal },
              { value: "large", label: copy.account.textLarge },
            ]}
          />
          <View style={styles.rowBetween}>
            <AppText variant="bodyMedium">{copy.account.hapticsTitle}</AppText>
            <Switch
              value={prefs.hapticsEnabled}
              onValueChange={(v) => void prefs.setHapticsEnabled(v)}
            />
          </View>
          <AppText variant="titleSmall">{copy.security.pinTitle}</AppText>
          <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {copy.security.pinHelp}
          </AppText>
          {prefs.pinEnabled ? (
            <>
              <View style={styles.rowBetween}>
                <AppText variant="bodyMedium">{copy.security.biometricTitle}</AppText>
                <Switch
                  value={prefs.biometricUnlockEnabled}
                  onValueChange={(v) => void prefs.setBiometricUnlockEnabled(v)}
                />
              </View>
              <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.security.biometricHelp}
              </AppText>
              <GsButton variant="outline" onPress={() => void prefs.clearPin().then(() => showSuccess(copy.security.pinRemoved))}>
                <ButtonText>{copy.security.removePin}</ButtonText>
              </GsButton>
            </>
          ) : (
            <GsButton variant="outline" onPress={() => setPinDialogOpen(true)}>
              <ButtonText>{copy.security.setPin}</ButtonText>
            </GsButton>
          )}
        </AppCardContent>
      </AppCard>

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

      <AppCard style={styles.card}>
        <AppCardContent style={styles.gap}>
          <AppText variant="titleMedium">{copy.account.dataTitle}</AppText>
          <GsButton variant="outline" onPress={() => router.push("/(tabs)/tools")}>
            <ButtonText>{copy.account.openTools}</ButtonText>
          </GsButton>
          <GsButton variant="outline" onPress={() => router.push("/design-gallery")}>
            <ButtonText>{copy.account.openUiGallery}</ButtonText>
          </GsButton>
        </AppCardContent>
      </AppCard>

      <AppCard style={styles.card}>
        <AppCardContent style={styles.gap}>
          <AppText variant="titleMedium">{copy.storage.whereRecordsKept}</AppText>
          <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
            {copy.storage.privateHelp}
          </AppText>
          <SegmentedControl
            value={storage.mode}
            onChange={(v) => void setMode(v)}
            options={[
              { value: "local", label: copy.storage.privateArchiveShort },
              { value: "online", label: copy.storage.familyCloudShort },
            ]}
          />
          <AppText variant="bodySmall">{copy.storage.memberCountLabel(storage.localMemberCount)}</AppText>
          {storage.mode === "local" && (
            <>
              <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.account.sampleFixtureCount(countFixturePeople())}
              </AppText>
              <GsButton
                variant="outline"
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
                {fixtureBusy ? <ButtonSpinner /> : null}
                <ButtonText>{copy.account.loadSampleFamily}</ButtonText>
              </GsButton>
              <GsButton
                variant="outline"
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
                className="self-start"
              >
                <ButtonText>{copy.account.clearSampleFamily}</ButtonText>
              </GsButton>
            </>
          )}
          {storage.mode === "local" && (
            <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              {copy.storage.cloudUrlWhenOnline}
            </AppText>
          )}
        </AppCardContent>
      </AppCard>

      {storage.mode === "online" && (
        <AppCard style={styles.card}>
          <AppCardContent style={styles.gap}>
            <AppText variant="titleMedium">{copy.account.familyCloudSignIn}</AppText>
            <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
              {copy.account.connectionAddressHelp}
            </AppText>
            <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
              {copy.account.connectionCurrent(storage.apiUrl)}
            </AppText>
            <FormTextInput
              testID="account-api-url"
              label={copy.account.connectionAddress}
              value={apiDraft}
              onChangeText={setApiDraft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.rowButtons}>
              <GsButton
                variant="outline"
                disabled={testingConnection}
                onPress={() => void onTestConnection()}
                style={styles.flexBtn}
              >
                {testingConnection ? <ButtonSpinner /> : null}
                <ButtonText>{copy.account.testConnection}</ButtonText>
              </GsButton>
              <GsButton
                variant="secondary"
                onPress={() => void onSaveConnection()}
                style={styles.flexBtn}
              >
                <ButtonText>{copy.account.saveConnection}</ButtonText>
              </GsButton>
            </View>
            {auth.token ? (
              <>
                <AppText variant="titleSmall">{copy.account.signedIn}</AppText>
                {auth.displayName && <AppText variant="bodyMedium">{auth.displayName}</AppText>}
                {auth.role && <AppText variant="labelMedium">{auth.role}</AppText>}
                <GsButton variant="outline" onPress={() => void auth.signOut()}>
                  <ButtonText className="text-destructive">{copy.account.signOut}</ButtonText>
                </GsButton>
              </>
            ) : (
              <>
                <FormTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <FormTextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <GsButton disabled={submitting} onPress={() => void onSignIn()}>
                  {submitting ? <ButtonSpinner /> : null}
                  <ButtonText>Sign in</ButtonText>
                </GsButton>
              </>
            )}
          </AppCardContent>
        </AppCard>
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
