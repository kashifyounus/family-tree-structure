import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useStorage } from "@/context/StorageContext";
import { listLocalMembers } from "@/lib/db/localRepository";
import {
  exportLocalDatabaseJson,
  importLocalDatabaseJson,
} from "@/lib/db/localRepository.ext";

export default function ToolsScreen() {
  const { mode, bumpDataRevision, localMemberCount } = useStorage();
  const [importText, setImportText] = useState("");
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");

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
      Alert.alert("Export failed", e instanceof Error ? e.message : "Error");
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tools</Text>

      {mode === "local" ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Backup & restore (SQLite)</Text>
            <Text style={styles.help}>
              Export JSON backup ({localMemberCount} people on device). Import
              replaces all local data.
            </Text>
            <Pressable style={styles.primary} onPress={() => void exportDb()}>
              <Text style={styles.primaryText}>Export database</Text>
            </Pressable>
            <TextInput
              style={styles.textarea}
              multiline
              placeholder="Paste backup JSON to import…"
              value={importText}
              onChangeText={setImportText}
            />
            <Pressable style={styles.secondary} onPress={importDb}>
              <Text style={styles.secondaryText}>Import from JSON</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Find two members (local)</Text>
            <TextInput
              style={styles.input}
              placeholder="Person A code or name"
              value={personA}
              onChangeText={setPersonA}
            />
            <TextInput
              style={styles.input}
              placeholder="Person B code or name"
              value={personB}
              onChangeText={setPersonB}
            />
            <Pressable style={styles.secondary} onPress={relationHint}>
              <Text style={styles.secondaryText}>Compare</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Text style={styles.help}>
          Switch to Local SQLite in Account to export/import backups. Online mode
          uses the server database — open the web dashboard for advanced kinship
          tools.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: { fontWeight: "700", fontSize: 16 },
  help: { fontSize: 13, lineHeight: 18, color: "#52525b" },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    fontSize: 12,
    fontFamily: "SpaceMono",
    textAlignVertical: "top",
  },
  primary: {
    backgroundColor: "#4f46e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondary: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    alignItems: "center",
  },
  secondaryText: { color: "#4338ca", fontWeight: "600" },
});
