import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { Screen } from "@/components/ui/Screen";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { backupDatabaseToGoogleDrive } from "@/lib/backup/googleDriveBackup";
import { listLocalMembers } from "@/lib/db/localRepository";
import {
  exportLocalDatabaseJson,
  importLocalDatabaseJson,
} from "@/lib/db/localRepository.ext";

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
          dialogTitle: "Export local family database",
        });
      } else {
        Alert.alert("Exported", `Saved to ${path}`);
      }
    } catch (e) {
      showError(e, "Export failed");
    }
  };

  const backupToDrive = async () => {
    setDriveBusy(true);
    try {
      const name = await backupDatabaseToGoogleDrive();
      showSuccess(`Uploaded ${name} to Google Drive`);
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
      Alert.alert("Import complete", "Local SQLite database replaced.");
    } catch (e) {
      Alert.alert("Import failed", e instanceof Error ? e.message : "Error");
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
      Alert.alert("Not found", "Enter valid family codes or names from local DB.");
      return;
    }
    if (a.id === b.id) {
      Alert.alert("Same person", "Choose two different members.");
      return;
    }
    Alert.alert(
      "Relationship (local)",
      `${a.firstName} and ${b.firstName} are both in your local tree. Use the online app for full kinship path finding, or open each profile to see unions and siblings.`,
    );
  };

  return (
    <Screen testID="tools-screen">
      <Text variant="headlineSmall" style={styles.title}>Tools</Text>

      {mode === "local" ? (
        <>
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">Google Drive backup (Android)</Text>
              <Text variant="bodySmall" style={styles.help}>
                Upload a native copy of your SQLite database to your Google Drive
                app folder. Requires Google Play Services and{" "}
                EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.
              </Text>
              <Button
                mode="contained"
                icon="google-drive"
                loading={driveBusy}
                onPress={() => void backupToDrive()}
              >
                Backup to Google Drive
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">Backup & restore (JSON)</Text>
              <Text variant="bodySmall" style={styles.help}>
                Export JSON backup ({localMemberCount} people). Import replaces all
                local data.
              </Text>
              <Button mode="contained" icon="export" onPress={() => void exportDb()}>
                Export database
              </Button>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="Paste backup JSON to import…"
                value={importText}
                onChangeText={setImportText}
              />
              <Button mode="outlined" onPress={importDb}>
                Import from JSON
              </Button>
            </Card.Content>
          </Card>

          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardInner}>
              <Text variant="titleMedium">Find two members (local)</Text>
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
                Compare
              </Button>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Text variant="bodyMedium" style={styles.help}>
          Switch to Local SQLite in Account to export/import backups. Online mode
          uses the server database — open the web dashboard for advanced kinship
          tools.
        </Text>
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
