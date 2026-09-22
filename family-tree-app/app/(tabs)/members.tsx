import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  useTheme,
} from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import { useAuth } from "@/context/AuthContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { formatGender } from "@/lib/format/gender";
import { createMember, listMembers, removeMember } from "@/lib/data/memberRepository";
import type { Gender, MemberRecord } from "@/lib/data/types";

export default function MembersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
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
  const [birthDate, setBirthDate] = useState("");
  const [createCity, setCreateCity] = useState("");

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
        birthDate: birthDate.trim() || undefined,
        currentCity: createCity.trim() || undefined,
      });
      setCreateOpen(false);
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setCreateCity("");
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

  const listBottom = tabBarHeight + 88;

  return (
    <KeyboardAvoidingView
      testID="members-screen"
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {mode === "local" ? copy.members.bannerPrivate : copy.members.bannerCloud}
        </Text>
        <Searchbar
          testID="members-search"
          placeholder={copy.members.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void load(query)}
          onIconPress={() => void load(query)}
          elevation={1}
          style={[styles.search, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ color: theme.colors.onSurface }}
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      {loading && members.length === 0 ? (
        <ActivityIndicator style={styles.loader} />
      ) : error ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.error, padding: 16 }}>
          {error}
        </Text>
      ) : (
        <FlatList
          testID="members-list"
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
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
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
                  {copy.account.memberReference}: {item.familyCode}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {formatGender(item.gender)}
                  {item.currentCity ? ` · ${item.currentCity}` : ""}
                </Text>
                {mode === "local" && (
                  <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
                    {copy.members.longPressDelete}
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text
              variant="bodyMedium"
              style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginTop: 32 }}
            >
              {mode === "local" ? copy.members.emptyPrivate : copy.members.emptyCloud}
            </Text>
          }
        />
      )}

      <Portal>
        <Dialog visible={createOpen} onDismiss={() => setCreateOpen(false)}>
          <Dialog.Title>{copy.members.newMemberTitle}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <View style={styles.dialogContent}>
              <FormTextInput
                testID="members-create-first"
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <FormTextInput
                testID="members-create-last"
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {copy.members.genderLabel}
              </Text>
              <FormTextInput
                label="Date of birth"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
              />
              <FormTextInput label="City" value={createCity} onChangeText={setCreateCity} />
              <SegmentedButtons
                value={gender}
                onValueChange={(v) => setGender(v as Gender)}
                buttons={[
                  { value: "MALE", label: copy.gender.MALE },
                  { value: "FEMALE", label: copy.gender.FEMALE },
                  { value: "OTHER", label: copy.gender.OTHER },
                ]}
              />
            </View>
          </Dialog.ScrollArea>
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
          style={[styles.fab, { bottom: tabBarHeight + 16 }]}
          onPress={() => setCreateOpen(true)}
          label={copy.members.addMember}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 10 },
  search: { borderRadius: 12 },
  loader: { marginTop: 32 },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: { marginBottom: 10, borderRadius: 16 },
  dialogScroll: { maxHeight: 360, paddingHorizontal: 0 },
  dialogContent: { gap: 12, paddingHorizontal: 24, paddingVertical: 8 },
  fab: { position: "absolute", right: 16 },
});
