import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { listLocalMembers } from "@/lib/db/localRepository";
import {
  exportLocalDatabaseJson,
  importLocalDatabaseJson,
} from "@/lib/db/localRepository.ext";
import { backupDatabaseToGoogleDrive } from "@/lib/backup/googleDriveBackup";

export default function ToolsScreen() {
  const theme = useTheme();
  const { mode, bumpDataRevision, localMemberCount } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const [importText, setImportText] = useState("");
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
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
          Alert.alert(copy.tools.importFile, copy.tools.fileBackupBody(localMemberCount), [
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
          ]);
        },
      },
    ]);
  };

  const relationHint = () => {
    const members = listLocalMembers();
    const a = members.find(
      (m) =>
        m.familyCode === personA.trim() ||
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(personA.toLowerCase()),
    );
    const b = members.find(
      (m) =>
        m.familyCode === personB.trim() ||
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(personB.toLowerCase()),
    );
    if (!a || !b) {
      Alert.alert(copy.tools.compareTitle, copy.tools.compareNotFound);
      return;
    }
    if (a.id === b.id) {
      Alert.alert(copy.tools.compareTitle, copy.tools.compareSame);
      return;
    }
    Alert.alert(copy.tools.compareTitle, copy.tools.compareResult);
  };

  return (
    <Screen testID="tools-screen">
      <PageHeader title={copy.tools.title} />

      {mode === "local" ? (
        <>
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">{copy.tools.driveTitle}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{copy.tools.driveBody}</Text>
              <Button
                testID="tools-drive-backup"
                mode="contained"
                icon="google-drive"
                loading={driveBusy}
                onPress={backupToDrive}
              >
                {copy.tools.driveButton}
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">{copy.tools.fileBackupTitle}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.tools.fileBackupBody(localMemberCount)}
              </Text>
              <Button
                testID="tools-export-file"
                mode="contained"
                icon="export"
                onPress={exportDb}
              >
                {copy.tools.exportFile}
              </Button>
              <FormTextInput
                multiline
                numberOfLines={6}
                label={copy.tools.importPlaceholder}
                value={importText}
                onChangeText={setImportText}
              />
              <Button mode="outlined" onPress={importDb}>
                {copy.tools.importFile}
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">{copy.tools.compareTitle}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.tools.compareHint}
              </Text>
              <FormTextInput label="Person A" value={personA} onChangeText={setPersonA} />
              <FormTextInput label="Person B" value={personB} onChangeText={setPersonB} />
              <Button mode="outlined" onPress={relationHint}>
                {copy.tools.compareButton}
              </Button>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{copy.tools.cloudOnly}</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, borderRadius: 16 },
  cardInner: { gap: 10 },
});
