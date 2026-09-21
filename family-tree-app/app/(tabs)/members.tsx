import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  FAB,
  Portal,
  Searchbar,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";

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
  const { showError, showSuccess } = useAppFeedback();
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

  const load = useCallback(
    async (q: string) => {
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
    },
    [mode, showError],
  );

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
      showSuccess(copy.success.saved);
    } catch (e) {
      showError(e);
    }
  };

  const onDelete = (member: MemberRecord) => {
    Alert.alert(
      copy.members.removeTitle,
      copy.members.removeConfirm(`${member.firstName} ${member.lastName}`),
      [
        { text: copy.reports.cancel, style: "cancel" },
        {
          text: copy.reports.delete,
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
    <View style={styles.root} testID="members-screen">
      <View style={styles.header}>
        <Text variant="labelMedium" style={styles.banner}>
          {mode === "local" ? copy.members.bannerPrivate : copy.members.bannerCloud}
        </Text>
        <Searchbar
          testID="members-search"
          placeholder={copy.members.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void load(query)}
          onIconPress={() => void load(query)}
          style={styles.search}
        />
      </View>

      {loading && members.length === 0 ? (
        <ActivityIndicator style={styles.loader} />
      ) : error ? (
        <Text variant="bodyMedium" style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          testID="members-list"
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => void load(query)}
          renderItem={({ item, index }) => (
            <Card
              testID={index === 0 ? "members-first-card" : undefined}
              mode="elevated"
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
              <Card.Content>
                <Text variant="titleMedium">
                  {item.firstName} {item.lastName}
                </Text>
                <Text variant="labelSmall" style={styles.reference}>
                  {copy.account.memberReference}: {item.familyCode}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {formatGender(item.gender)}
                  {item.currentCity ? ` · ${item.currentCity}` : ""}
                </Text>
                {mode === "local" && (
                  <Text variant="labelSmall" style={styles.longPress}>
                    {copy.members.longPressDelete}
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={styles.empty}>
              {mode === "local" ? copy.members.emptyPrivate : copy.members.emptyCloud}
            </Text>
          }
        />
      )}

      <Portal>
        <Dialog visible={createOpen} onDismiss={() => setCreateOpen(false)}>
          <Dialog.Title>{copy.members.newMemberTitle}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              testID="members-create-first"
              mode="outlined"
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              testID="members-create-last"
              mode="outlined"
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <SegmentedButtons
              value={gender}
              onValueChange={(v) => setGender(v as Gender)}
              buttons={[
                { value: "MALE", label: copy.gender.MALE },
                { value: "FEMALE", label: copy.gender.FEMALE },
                { value: "OTHER", label: copy.gender.OTHER },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateOpen(false)}>{copy.reports.cancel}</Button>
            <Button testID="members-create-save" mode="contained" onPress={() => void onCreate()}>
              {copy.members.saveMember}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {canCreate && !createOpen && (
        <FAB
          testID="members-add"
          icon="plus"
          style={styles.fab}
          onPress={() => setCreateOpen(true)}
          label={copy.members.addMember}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, paddingBottom: 8, gap: 10 },
  banner: { color: "#4f46e5" },
  search: { elevation: 0, backgroundColor: "#fff" },
  loader: { marginTop: 32 },
  listContent: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 10, borderRadius: 16 },
  reference: { color: "#4f46e5", marginTop: 4, fontFamily: "SpaceMono" },
  meta: { color: "#64748b", marginTop: 4 },
  longPress: { color: "#94a3b8", marginTop: 8 },
  error: { color: "#b91c1c", padding: 16 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32, paddingHorizontal: 16 },
  dialogContent: { gap: 12 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
