import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { DemoArchiveBanner } from "@/components/archive/DemoArchiveBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import {
  exportLocalDatabaseJson,
  importLocalDatabaseJson,
} from "@/lib/db/localRepository.ext";
import { backupDatabaseToGoogleDrive } from "@/lib/backup/googleDriveBackup";
import { defaultJsonExportCachePath } from "../../../shared/backupArtifacts";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

export default function ToolsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { mode, archiveLane, bumpDataRevision, localMemberCount } = useStorage();
  const liveBackupEnabled = mode === "local" && archiveLane === "live";
  const { showError, showSuccess } = useAppFeedback();
  const { compareA } = useLocalSearchParams<{ compareA?: string }>();
  const [importText, setImportText] = useState("");
  const [driveBusy, setDriveBusy] = useState(false);

  const exportDb = () => {
    Alert.alert(copy.tools.exportFile, copy.tree.exportPrivacyHint, [
      { text: copy.reports.cancel, style: "cancel" },
      {
        text: copy.tools.exportFile,
        onPress: () => void runExport(),
      },
    ]);
  };

  const runExport = async () => {
    try {
      const json = exportLocalDatabaseJson();
      const path = defaultJsonExportCachePath(cacheDirectory ?? "");
      await writeAsStringAsync(path, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: "application/json",
          dialogTitle: copy.tools.exportFile,
        });
      } else {
        showSuccess(copy.tools.exportFile);
      }
    } catch (e) {
      showError(e);
    }
  };

  const backupToDrive = () => {
    Alert.alert(copy.tools.driveTitle, copy.tree.exportPrivacyHint, [
      { text: copy.reports.cancel, style: "cancel" },
      {
        text: copy.tools.driveButton,
        onPress: () => {
          Alert.alert(copy.tools.driveTitle, copy.tools.driveBody, [
            { text: copy.reports.cancel, style: "cancel" },
            { text: "Continue", onPress: () => void runDriveBackup() },
          ]);
        },
      },
    ]);
  };

  const runDriveBackup = async () => {
    setDriveBusy(true);
    try {
      const name = await backupDatabaseToGoogleDrive();
      showSuccess(copy.tools.driveSuccess(name));
    } catch (e) {
      showError(e);
    } finally {
      setDriveBusy(false);
    }
  };

  const importDb = () => {
    Alert.alert(copy.tools.importFile, copy.tools.fileBackupBody(localMemberCount), [
      { text: copy.reports.cancel, style: "cancel" },
      {
        text: "Continue",
        onPress: () => {
          Alert.alert(
            copy.tools.importConfirmTitle,
            copy.tools.importConfirmBody(localMemberCount),
            [
            { text: copy.reports.cancel, style: "cancel" },
            {
              text: copy.tools.importFile,
              style: "destructive",
              onPress: () => {
                try {
                  importLocalDatabaseJson(importText);
                  bumpDataRevision();
                  setImportText("");
                  showSuccess(copy.tools.importSuccess);
                } catch (e) {
                  showError(e);
                }
              },
            },
          ],
          );
        },
      },
    ]);
  };

  const openFindRelation = () => {
    router.push({
      pathname: "/find-relation",
      params: compareA ? { personA: String(compareA) } : {},
    });
  };

  return (
    <Screen testID="tools-screen">
      <PageHeader title={copy.tools.title} />

      {archiveLane === "demo" && <DemoArchiveBanner testID="tools-demo-banner" />}

      {mode === "local" ? (
        <>
          {liveBackupEnabled ? (
            <>
              <AppCard style={styles.card}>
                <AppCardContent style={styles.cardInner}>
                  <AppText variant="titleMedium">{copy.tools.driveTitle}</AppText>
                  <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{copy.tools.driveBody}</AppText>
                  <Button
                    testID="tools-drive-backup"
                    disabled={driveBusy}
                    onPress={backupToDrive}
                  >
                    {driveBusy ? <ButtonSpinner /> : null}
                    <ButtonText>{copy.tools.driveButton}</ButtonText>
                  </Button>
                </AppCardContent>
              </AppCard>

              <AppCard style={styles.card}>
                <AppCardContent style={styles.cardInner}>
                  <AppText variant="titleMedium">{copy.tools.fileBackupTitle}</AppText>
                  <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {copy.tools.fileBackupBody(localMemberCount)}
                  </AppText>
                  <Button testID="tools-export-file" onPress={exportDb}>
                    <ButtonText>{copy.tools.exportFile}</ButtonText>
                  </Button>
                  <FormTextInput
                    multiline
                    numberOfLines={6}
                    label={copy.tools.importPlaceholder}
                    value={importText}
                    onChangeText={setImportText}
                  />
                  <Button variant="outline" onPress={importDb}>
                    <ButtonText>{copy.tools.importFile}</ButtonText>
                  </Button>
                </AppCardContent>
              </AppCard>
            </>
          ) : (
            <AppCard style={styles.card}>
              <AppCardContent style={styles.cardInner}>
                <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
                  {copy.tools.liveBackupOnly}
                </AppText>
              </AppCardContent>
            </AppCard>
          )}

          <AppCard style={styles.card}>
            <AppCardContent style={styles.cardInner}>
              <AppText variant="titleMedium">{copy.tools.findRelationTitle}</AppText>
              <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.tools.findRelationIntro}
              </AppText>
              <Button variant="outline" onPress={openFindRelation}>
                <ButtonText>{copy.tools.findRelationRun}</ButtonText>
              </Button>
            </AppCardContent>
          </AppCard>
        </>
      ) : (
        <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{copy.tools.cloudOnly}</AppText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, borderRadius: 16 },
  cardInner: { gap: 10 },
});
