import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

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
  const { mode, bumpDataRevision, localMemberCount } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const [importText, setImportText] = useState("");
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");
  const [driveBusy, setDriveBusy] = useState(false);

  const exportDb = async () => {
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

  const backupToDrive = async () => {
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
    try {
      importLocalDatabaseJson(importText);
      bumpDataRevision();
      setImportText("");
      showSuccess(copy.tools.importSuccess);
    } catch (e) {
      showError(e);
    }
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
      <Text variant="headlineSmall" style={styles.title}>{copy.tools.title}</Text>

      {mode === "local" ? (
        <>
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">{copy.tools.driveTitle}</Text>
              <Text variant="bodySmall" style={styles.help}>{copy.tools.driveBody}</Text>
              <Button
                testID="tools-drive-backup"
                mode="contained"
                icon="google-drive"
                loading={driveBusy}
                onPress={() => void backupToDrive()}
              >
                {copy.tools.driveButton}
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">{copy.tools.fileBackupTitle}</Text>
              <Text variant="bodySmall" style={styles.help}>
                {copy.tools.fileBackupBody(localMemberCount)}
              </Text>
              <Button
                testID="tools-export-file"
                mode="contained"
                icon="export"
                onPress={() => void exportDb()}
              >
                {copy.tools.exportFile}
              </Button>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder={copy.tools.importPlaceholder}
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
              <Text variant="bodySmall" style={styles.help}>{copy.tools.compareHint}</Text>
              <TextInput
                mode="outlined"
                label="Person A"
                value={personA}
                onChangeText={setPersonA}
              />
              <TextInput
                mode="outlined"
                label="Person B"
                value={personB}
                onChangeText={setPersonB}
              />
              <Button mode="outlined" onPress={relationHint}>
                {copy.tools.compareButton}
              </Button>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Text variant="bodyMedium" style={styles.help}>{copy.tools.cloudOnly}</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 8 },
  card: { marginBottom: 12, borderRadius: 16 },
  cardInner: { gap: 10 },
  help: { color: "#64748b", lineHeight: 20 },
});
