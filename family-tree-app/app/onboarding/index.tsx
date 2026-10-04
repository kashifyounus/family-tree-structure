import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";

import { OnboardingHero } from "@/components/onboarding/OnboardingHero";
import { copy } from "@/content/businessCopy";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button as GsButton, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { Screen } from "@/components/ui/Screen";
import { useAppFeedback } from "@/context/ErrorContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { setupDemoArchive } from "@/lib/localAccount/demoSetup";
import { setupKayShowcaseArchive } from "@/lib/localAccount/kayShowcaseSetup";
import type { Gender } from "@/lib/data/types";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

type Step = "start" | "local";

const STEPS: Step[] = ["start", "local"];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const storage = useStorage();
  const localAccount = useLocalAccount();
  const { showError, showSuccess } = useAppFeedback();

  const [step, setStep] = useState<Step>("start");
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");

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
    await storage.setArchiveLane("live");
    setDisplayName("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setGender("MALE");
    go("local");
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

  const onKayShowcase = async () => {
    setBusy(true);
    try {
      await storage.setMode("local");
      await storage.setArchiveLane("demo");
      const session = await setupKayShowcaseArchive();
      await localAccount.refresh();
      storage.bumpDataRevision();
      showSuccess(copy.onboarding.welcomeNamed(session.displayName, session.focalFamilyCode));
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
      await storage.setArchiveLane("demo");
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

  return (
    <Screen scroll safeTop animated={false} testID="onboarding-screen">
      <ProgressBar progress={progress} style={styles.progress} />
      {step === "start" ? (
        <OnboardingHero title={copy.onboarding.welcomeTitle} subtitle={copy.onboarding.welcomeBody} />
      ) : (
        <OnboardingHero
          title={copy.onboarding.registerTitle}
          subtitle={copy.onboarding.registerBody}
        />
      )}

      <Animated.View
        key={step}
        entering={SlideInRight.duration(280)}
        exiting={SlideOutLeft.duration(200)}
        style={styles.step}
      >
        {step === "start" && (
          <AppCard className="rounded-2xl border-border">
            <AppCardContent style={styles.cardContent}>
              <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.onboarding.chooseStorageBody}
              </AppText>
              <GsButton
                testID="onboarding-kay-showcase"
                onPress={() => void onKayShowcase()}
                disabled={busy}
                className="w-full rounded-full min-h-12"
              >
                {busy ? <ButtonSpinner /> : null}
                <ButtonText className="font-semibold">{copy.onboarding.kayShowcaseTitle}</ButtonText>
              </GsButton>
              <AppText variant="labelSmall" className="text-muted-foreground text-center px-2">
                {copy.onboarding.kayShowcaseBody}
              </AppText>
              <GsButton
                testID="onboarding-get-started"
                variant="outline"
                onPress={() => void startPrivate()}
                className="w-full rounded-full min-h-12"
              >
                <ButtonText>{copy.onboarding.privateChoice}</ButtonText>
              </GsButton>
              <GsButton
                testID="onboarding-load-demo"
                variant="ghost"
                disabled={busy}
                onPress={() => void onLoadDemo()}
                className="w-full"
              >
                {busy ? <ButtonSpinner /> : null}
                <ButtonText>{copy.onboarding.loadDemoFamily}</ButtonText>
              </GsButton>
            </AppCardContent>
          </AppCard>
        )}

        {step === "local" && (
          <AppCard className="rounded-2xl border-border">
            <AppCardContent style={styles.cardContent}>
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
              <GsButton
                testID="onboarding-create-profile"
                onPress={() => void onRegisterLocal()}
                disabled={busy}
                className="w-full rounded-full min-h-12"
              >
                {busy ? <ButtonSpinner /> : null}
                <ButtonText className="font-semibold">{copy.onboarding.createProfile}</ButtonText>
              </GsButton>
              <GsButton variant="ghost" onPress={() => go("start")} className="w-full">
                <ButtonText>Back</ButtonText>
              </GsButton>
            </AppCardContent>
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
