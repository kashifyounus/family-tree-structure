import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Banner, FAB, Searchbar, Text, useTheme } from "react-native-paper";

import { MemberCard } from "@/components/members/MemberCard";

import { AppDialogForm } from "@/components/ui/AppDialogForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { LoadingView } from "@/components/ui/LoadingView";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAuth } from "@/context/AuthContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { createMember, listMembers, removeMember } from "@/lib/data/memberRepository";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import type { Gender, MemberRecord } from "@/lib/data/types";
import { layout, radius, space } from "@/theme/tokens";

export default function MembersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const router = useRouter();
  const { mode, dataRevision, bumpDataRevision } = useStorage();
  const auth = useAuth();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();
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
  const [createFieldErrors, setCreateFieldErrors] = useState<FieldErrors>({});

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
    const errors: FieldErrors = {
      firstName: required(firstName, "First name"),
      lastName: required(lastName, "Last name"),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as FieldErrors;
    if (Object.keys(filtered).length > 0) {
      setCreateFieldErrors(filtered);
      showError(new Error(firstFieldError(filtered) ?? copy.errors.validation));
      return;
    }
    setCreateFieldErrors({});
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
      impactLight();
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
                impactLight();
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

  if (loading && members.length === 0 && !error) {
    return <LoadingView message={copy.members.searchPlaceholder} />;
  }

  return (
    <Screen testID="members-screen" scroll={false} padded={false} animated={false}>
      <View style={styles.header}>
        <Banner visible icon="information" style={styles.banner}>
          {mode === "local" ? copy.members.bannerPrivate : copy.members.bannerCloud}
        </Banner>
        <Searchbar
          testID="members-search"
          placeholder={copy.members.searchPlaceholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => void load(query)}
          onIconPress={() => void load(query)}
          elevation={layout.fabOffset === 16 ? 1 : 1}
          style={[styles.search, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ color: theme.colors.onSurface }}
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      {error ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.error, padding: space.lg }}>
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
            <MemberCard
              testID={index === 0 ? "members-first-card" : undefined}
              member={item}
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: item.id, code: item.familyCode },
                })
              }
              onLongPress={() => {
                if (mode === "local") onDelete(item);
              }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="account-multiple-outline"
              title={mode === "local" ? copy.members.emptyPrivate : copy.members.emptyCloud}
              actionLabel={canCreate ? copy.members.addMember : undefined}
              onAction={canCreate ? () => setCreateOpen(true) : undefined}
            />
          }
        />
      )}

      <AppDialogForm
        visible={createOpen}
        title={copy.members.newMemberTitle}
        onDismiss={() => {
          setCreateOpen(false);
          setCreateFieldErrors({});
        }}
        onSubmit={() => void onCreate()}
        submitLabel={copy.members.saveMember}
        submitTestID="members-create-save"
        cancelLabel={copy.reports.cancel}
      >
        <FormTextInput
          testID="members-create-first"
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          errorText={createFieldErrors.firstName}
          autoCapitalize="words"
        />
        <FormTextInput
          testID="members-create-last"
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          errorText={createFieldErrors.lastName}
          autoCapitalize="words"
        />
        <FormTextInput
          label="Date of birth"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
        />
        <FormTextInput label="City" value={createCity} onChangeText={setCreateCity} />
        <GenderField value={gender} onChange={setGender} />
      </AppDialogForm>

      {canCreate && !createOpen && (
        <FAB
          testID="members-add"
          icon="plus"
          style={[styles.fab, { bottom: tabBarHeight + layout.fabOffset }]}
          onPress={() => setCreateOpen(true)}
          label={copy.members.addMember}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm, gap: space.md },
  banner: { borderRadius: radius.md },
  search: { borderRadius: radius.md },
  listContent: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.xs },
  fab: { position: "absolute", right: layout.screenPaddingX },
});
