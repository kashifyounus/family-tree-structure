import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { copy } from "@/content/businessCopy";
import { useAuth } from "@/context/AuthContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { formatGender } from "@/lib/format/gender";
import { createMember, listMembers, removeMember } from "@/lib/data/memberRepository";
import type { Gender, MemberRecord } from "@/lib/data/types";

export default function MembersScreen() {
  const router = useRouter();
  const { mode, dataRevision, bumpDataRevision } = useStorage();
  const auth = useAuth();
  const { showError } = useAppFeedback();
  const canCreate =
    mode === "local" ||
    (mode === "online" && auth.token && auth.role !== "VIEWER");
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await listMembers(mode, q);
      setMembers(list);
    } catch (e) {
      setError(copy.errors.generic);
      showError(e);
    } finally {
      setLoading(false);
    }
  }, [mode, showError]);

  useEffect(() => {
    void load("");
  }, [load, dataRevision, mode]);

  const onCreate = async () => {
    try {
      await createMember(mode, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
      });
      setCreateOpen(false);
      setFirstName("");
      setLastName("");
      bumpDataRevision();
    } catch (e) {
      showError(e);
    }
  };

  const onDelete = (member: MemberRecord) => {
    Alert.alert(
      copy.members.removeTitle,
      copy.members.removeConfirm(`${member.firstName} ${member.lastName}`),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await removeMember(mode, member.id);
                bumpDataRevision();
              } catch (e) {
                showError(e);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.modeBanner}>
        {mode === "local" ? copy.members.bannerPrivate : copy.members.bannerCloud}
      </Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={copy.members.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void load(query)}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={() => void load(query)}>
          <Text style={styles.searchBtnText}>Go</Text>
        </Pressable>
      </View>
      {canCreate && (
        <Pressable style={styles.addBtn} onPress={() => setCreateOpen(true)}>
          <Text style={styles.addBtnText}>+ {copy.members.addMember}</Text>
        </Pressable>
      )}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => void load(query)} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: item.id, code: item.familyCode },
                })
              }
              onLongPress={() => {
                if (mode === "local") onDelete(item);
              }}
            >
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.code}>{item.familyCode}</Text>
              <Text style={styles.meta}>
                {formatGender(item.gender)}
                {item.currentCity ? ` · ${item.currentCity}` : ""}
              </Text>
              {mode === "local" && (
                <Text style={styles.longPress}>{copy.members.longPressDelete}</Text>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {mode === "local" ? copy.members.emptyPrivate : copy.members.emptyCloud}
            </Text>
          }
        />
      )}

      <Modal visible={createOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.members.newMemberTitle}</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <View style={styles.genderRow}>
              {(["MALE", "FEMALE", "OTHER"] as Gender[]).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.genderChip, gender === g && styles.genderActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={gender === g ? styles.genderActiveText : undefined}>
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.inBtn} onPress={() => void onCreate()}>
              <Text style={styles.inBtnText}>{copy.members.saveMember}</Text>
            </Pressable>
            <Pressable onPress={() => setCreateOpen(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  modeBanner: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338ca",
    marginBottom: 10,
  },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  searchBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  searchBtnText: { color: "#fff", fontWeight: "600" },
  addBtn: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  addBtnText: { color: "#4338ca", fontWeight: "600" },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#18181b" },
  code: { fontFamily: "SpaceMono", fontSize: 12, color: "#4f46e5", marginTop: 4 },
  meta: { fontSize: 12, color: "#71717a", marginTop: 4 },
  longPress: { fontSize: 10, color: "#a1a1aa", marginTop: 6 },
  error: { color: "#dc2626", marginTop: 12 },
  empty: { textAlign: "center", color: "#71717a", marginTop: 24 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  genderRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  genderActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  genderActiveText: { color: "#fff", fontWeight: "600" },
  inBtn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  inBtnText: { color: "#fff", fontWeight: "600" },
  cancel: { textAlign: "center", marginTop: 12, color: "#71717a" },
});
