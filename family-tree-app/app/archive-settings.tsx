import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import { Stack, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, View } from "react-native";

import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import {
  exportLocalDatabaseJson,
  importLocalDatabaseJson,
} from "@/lib/db/localRepository.ext";
import { backupDatabaseToGoogleDrive } from "@/lib/backup/googleDriveBackup";
import { AppText } from "@/components/ui/AppText";

export default function ArchiveSettingsScreen() {
  const router = useRouter();
  const { mode, bumpDataRevision, localMemberCount } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
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
      const path = `${cacheDirectory}mughals-family-backup.json`;
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

  return (
    <>
      <Stack.Screen options={{ title: "Archive settings", headerBackTitle: "Account" }} />
      <Screen testID="archive-settings-screen">
        <AppText variant="bodyMedium" className="text-muted-foreground mb-4">
          Export, backup, and restore your private archive. Advanced utilities remain on the Tools
          screen.
        </AppText>

        {mode === "local" ? (
          <View className="gap-4">
            <View className="rounded-xl border border-border bg-card p-4 gap-3">
              <AppText variant="titleSmall" className="font-semibold">
                {copy.tools.fileBackupTitle}
              </AppText>
              <AppText variant="bodySmall" className="text-muted-foreground">
                {copy.tools.fileBackupBody(localMemberCount)}
              </AppText>
              <Button testID="archive-export-file" onPress={exportDb}>
                <ButtonText>{copy.tools.exportFile}</ButtonText>
              </Button>
            </View>

            <View className="rounded-xl border border-border bg-card p-4 gap-3">
              <AppText variant="titleSmall" className="font-semibold">
                {copy.tools.driveTitle}
              </AppText>
              <AppText variant="bodySmall" className="text-muted-foreground">
                {copy.tools.driveBody}
              </AppText>
              <Button
                testID="archive-drive-backup"
                disabled={driveBusy}
                onPress={() => void runDriveBackup()}
              >
                {driveBusy ? <ButtonSpinner /> : null}
                <ButtonText>{copy.tools.driveButton}</ButtonText>
              </Button>
            </View>

            <View className="rounded-xl border border-border bg-card p-4 gap-3">
              <FormTextInput
                multiline
                numberOfLines={5}
                label={copy.tools.importPlaceholder}
                value={importText}
                onChangeText={setImportText}
              />
              <Button variant="outline" onPress={importDb}>
                <ButtonText>{copy.tools.importFile}</ButtonText>
              </Button>
            </View>
          </View>
        ) : (
          <AppText variant="bodyMedium" className="text-muted-foreground">
            {copy.tools.cloudOnly}
          </AppText>
        )}

        <Button
          variant="link"
          className="mt-6"
          onPress={() => router.push("/(tabs)/tools")}
        >
          <ButtonText>Open full Tools</ButtonText>
        </Button>
      </Screen>
    </>
  );
}
