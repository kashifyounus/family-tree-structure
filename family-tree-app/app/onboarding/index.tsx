import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  HelperText,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";

import { copy } from "@/content/businessCopy";
import { BrandLogo } from "@/components/BrandLogo";
import { AppCard } from "@/components/ui/AppCard";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { Screen } from "@/components/ui/Screen";
import { useAppFeedback } from "@/context/ErrorContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_LOGIN_EMAIL, DEFAULT_LOGIN_PASSWORD } from "@/context/AuthContext";
import { setupDemoArchive } from "@/lib/localAccount/demoSetup";
import type { Gender } from "@/lib/data/types";

type Step = "start" | "local" | "online";

const STEPS: Step[] = ["start", "local", "online"];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const storage = useStorage();
  const localAccount = useLocalAccount();
  const auth = useAuth();
  const { showError, showSuccess } = useAppFeedback();

  const [step, setStep] = useState<Step>("start");
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");

  const [apiUrl, setApiUrl] = useState(storage.apiUrl);
  const [serverEmail, setServerEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [serverPassword, setServerPassword] = useState(DEFAULT_LOGIN_PASSWORD);

  const progress = (STEPS.indexOf(step) + 1) / STEPS.length;

  const finish = async () => {
    await storage.completeOnboarding();
    router.replace("/(tabs)");
  };

  const go = (next: Step) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(next);
  };

  const startPrivate = async () => {
    await storage.setMode("local");
    go("local");
  };

  const startCloud = async () => {
    await storage.setMode("online");
    go("online");
  };

  const onRegisterLocal = async () => {
    setBusy(true);
    try {
      const session = await localAccount.register({
        displayName,
        email,
        password,
        firstName,
        lastName,
        gender,
      });
      storage.bumpDataRevision();
      showSuccess(
        copy.onboarding.welcomeNamed(session.displayName, session.focalFamilyCode),
      );
      await finish();
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const onLoadDemo = async () => {
    setBusy(true);
    try {
      await storage.setMode("local");
      const session = await setupDemoArchive();
      await localAccount.refresh();
      storage.bumpDataRevision();
      showSuccess(copy.onboarding.demoLoaded(session.focalFamilyCode));
      await finish();
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const onOnlineSetup = async () => {
    setBusy(true);
    try {
      await storage.setApiUrl(apiUrl);
      const err = await auth.signIn(serverEmail.trim(), serverPassword);
      if (err) {
        showError(err);
        return;
      }
      showSuccess(copy.onboarding.cloudConnected);
      await finish();
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const onSkipOnlineAuth = async () => {
    await storage.setApiUrl(apiUrl);
    showSuccess(copy.onboarding.addressSaved);
    await finish();
  };

  return (
    <Screen scroll testID="onboarding-screen">
      <ProgressBar progress={progress} style={styles.progress} />
      <BrandLogo size={96} />

      <Animated.View
        key={step}
        entering={SlideInRight.duration(280)}
        exiting={SlideOutLeft.duration(200)}
        style={styles.step}
      >
        {step === "start" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">{copy.onboarding.welcomeTitle}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.onboarding.chooseStorageBody}
              </Text>
              <Button
                testID="onboarding-get-started"
                mode="contained"
                onPress={() => void startPrivate()}
              >
                {copy.onboarding.privateChoice}
              </Button>
              <Button mode="outlined" onPress={() => void startCloud()}>
                {copy.onboarding.cloudChoice}
              </Button>
              <Button
                testID="onboarding-load-demo"
                mode="text"
                loading={busy}
                onPress={() => void onLoadDemo()}
              >
                {copy.onboarding.loadDemoFamily}
              </Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "local" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">{copy.onboarding.registerTitle}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.onboarding.registerBody}
              </Text>
              <FormTextInput
                testID="onboarding-display-name"
                label={copy.onboarding.displayName}
                value={displayName}
                onChangeText={setDisplayName}
              />
              <FormTextInput
                testID="onboarding-email"
                label={copy.onboarding.email}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <FormTextInput
                testID="onboarding-password"
                label={copy.onboarding.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <FormTextInput
                testID="onboarding-first-name"
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <FormTextInput
                testID="onboarding-last-name"
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
              />
              <GenderField
                value={gender}
                onChange={setGender}
                label={copy.onboarding.startingMember}
              />
              <Button
                testID="onboarding-create-profile"
                mode="contained"
                loading={busy}
                onPress={() => void onRegisterLocal()}
              >
                {copy.onboarding.createProfile}
              </Button>
              <Button onPress={() => go("start")}>Back</Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "online" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">{copy.onboarding.cloudTitle}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.onboarding.cloudBody}
              </Text>
              <FormTextInput
                label={copy.account.connectionAddress}
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
              />
              <HelperText type="info">https://your-family-site.com</HelperText>
              <FormTextInput
                label="Email"
                value={serverEmail}
                onChangeText={setServerEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <FormTextInput
                label="Password"
                value={serverPassword}
                onChangeText={setServerPassword}
                secureTextEntry
              />
              <Button mode="contained" loading={busy} onPress={() => void onOnlineSetup()}>
                {copy.onboarding.signInContinue}
              </Button>
              <Button onPress={() => void onSkipOnlineAuth()}>
                {copy.onboarding.saveAddressOnly}
              </Button>
              <Button onPress={() => go("start")}>Back</Button>
            </Card.Content>
          </AppCard>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { marginBottom: 16, borderRadius: 8 },
  step: { marginTop: 8 },
  cardContent: { gap: 12 },
});
