import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  HelperText,
  ProgressBar,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";

import { BrandLogo } from "@/components/BrandLogo";
import { AppCard } from "@/components/ui/AppCard";
import { Screen } from "@/components/ui/Screen";
import { useAppFeedback } from "@/context/ErrorContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_LOGIN_EMAIL, DEFAULT_LOGIN_PASSWORD } from "@/context/AuthContext";
import type { Gender, StorageMode } from "@/lib/data/types";

type Step = "welcome" | "mode" | "local" | "online" | "done";

const STEPS: Step[] = ["welcome", "mode", "local", "online", "done"];

export default function OnboardingScreen() {
  const router = useRouter();
  const storage = useStorage();
  const localAccount = useLocalAccount();
  const auth = useAuth();
  const { showError, showSuccess } = useAppFeedback();

  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<StorageMode>("local");
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

  const go = (next: Step) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(next);
  };

  const finish = async () => {
    await storage.completeOnboarding();
    router.replace("/(tabs)");
  };

  const onChooseMode = async (next: StorageMode) => {
    setMode(next);
    await storage.setMode(next);
    go(next === "local" ? "local" : "online");
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
      showSuccess(`Welcome, ${session.displayName}. Your family code is ${session.focalFamilyCode}.`);
      go("done");
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
        showError(err, "Sign in failed");
        return;
      }
      showSuccess("Connected to your family server.");
      go("done");
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const onSkipOnlineAuth = async () => {
    await storage.setApiUrl(apiUrl);
    showSuccess("API URL saved. You can sign in later from Account.");
    go("done");
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
        {step === "welcome" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">Welcome</Text>
              <Text variant="bodyMedium" style={styles.muted}>
                Build and explore your family tree with a polished, offline-first
                experience — or connect to your shared server when you are ready.
              </Text>
              <Button mode="contained" onPress={() => go("mode")}>
                Get started
              </Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "mode" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">How should we store your data?</Text>
              <Text variant="bodyMedium" style={styles.muted}>
                Local SQLite keeps everything on this phone. Online mode uses your
                Mughal&apos;s Family Tree server API (you can add it later even if you
                start local).
              </Text>
              <View style={styles.modeCards}>
                <Chip
                  icon="database"
                  selected={mode === "local"}
                  onPress={() => onChooseMode("local")}
                  style={styles.chip}
                >
                  Local SQLite (private)
                </Chip>
                <Chip
                  icon="cloud"
                  selected={mode === "online"}
                  onPress={() => onChooseMode("online")}
                  style={styles.chip}
                >
                  Online API (shared)
                </Chip>
              </View>
              <Button onPress={() => go("welcome")}>Back</Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "local" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">Create your local account</Text>
              <Text variant="bodySmall" style={styles.muted}>
                We&apos;ll register you on this device and create your focal family
                member so you can grow the tree immediately.
              </Text>
              <TextInput label="Display name" value={displayName} onChangeText={setDisplayName} />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Text variant="labelLarge" style={styles.section}>
                You (focal person)
              </Text>
              <TextInput label="First name" value={firstName} onChangeText={setFirstName} />
              <TextInput label="Last name" value={lastName} onChangeText={setLastName} />
              <SegmentedButtons
                value={gender}
                onValueChange={(v) => setGender(v as Gender)}
                buttons={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
              <Button mode="contained" loading={busy} onPress={() => void onRegisterLocal()}>
                Create account & tree
              </Button>
              <Button onPress={() => go("mode")}>Back</Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "online" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">Connect to server</Text>
              <TextInput
                label="API base URL"
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
              />
              <HelperText type="info">Example: https://your-site.com</HelperText>
              <TextInput
                label="Email"
                value={serverEmail}
                onChangeText={setServerEmail}
                autoCapitalize="none"
              />
              <TextInput
                label="Password"
                value={serverPassword}
                onChangeText={setServerPassword}
                secureTextEntry
              />
              <Button mode="contained" loading={busy} onPress={() => void onOnlineSetup()}>
                Sign in & continue
              </Button>
              <Button onPress={() => void onSkipOnlineAuth()}>Save URL only</Button>
              <Button onPress={() => go("mode")}>Back</Button>
            </Card.Content>
          </AppCard>
        )}

        {step === "done" && (
          <AppCard>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge">You&apos;re all set</Text>
              <Text variant="bodyMedium" style={styles.muted}>
                Open the tree, add relatives, run reports, and back up your SQLite
                database to Google Drive from Tools (Android).
              </Text>
              <Button mode="contained" onPress={() => void finish()}>
                Enter app
              </Button>
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
  muted: { color: "#64748b" },
  modeCards: { gap: 8 },
  chip: { alignSelf: "stretch", justifyContent: "flex-start" },
  section: { marginTop: 4 },
});
