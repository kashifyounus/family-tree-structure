import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  MemberFilterChips,
  type MemberFilterChip,
} from "@/components/members/MemberFilterChips";
import { MembersSearchField } from "@/components/members/MembersSearchField";
import { PersonRow } from "@/components/members/PersonRow";

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
import { formatBilingualName } from "@/lib/format/displayName";
import {
  SHOWCASE_MARGARET_ID,
  filterShowcaseMembers,
  showcaseMemberRows,
  showcaseMembersCount,
} from "@/lib/mock/kuriosityShowcase";
import { motion } from "@/theme/motion";
import { layout, space } from "@/theme/tokens";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

type ListRow =
  | { kind: "showcase"; id: string; initials: string; name: string; subtitle: string }
  | { kind: "member"; member: MemberRecord };

export default function MembersScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const router = useRouter();
  const { mode, dataRevision, bumpDataRevision, localMemberCount } = useStorage();
  const auth = useAuth();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();
  const canCreate =
    mode === "local" ||
    (mode === "online" && auth.token && auth.role !== "VIEWER");
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<MemberFilterChip>("all");
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
    setQuery("");
  }, [mode]);

  useEffect(() => {
    void load(query.trim());
  }, [dataRevision, load]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void load(query.trim());
    }, motion.screenEnter);
    return () => clearTimeout(handle);
  }, [query, load]);

  const peopleCountLabel = useMemo(() => {
    const count = showcaseMembersCount(
      mode === "local" ? localMemberCount : members.length,
    );
    return `${count} people`;
  }, [localMemberCount, members.length, mode]);

  const listRows = useMemo((): ListRow[] => {
    const showcase = filterShowcaseMembers(showcaseMemberRows, query, chip).map((r) => ({
      kind: "showcase" as const,
      id: r.id,
      initials: r.initials,
      name: r.name,
      subtitle: r.subtitle,
    }));

    const q = query.trim().toLowerCase();
    let db = members;
    if (chip === "living") {
      db = db.filter((m) => !m.deathDate);
    }
    if (chip === "generations") {
      db = [...db].sort((a, b) => (a.birthDate ?? "").localeCompare(b.birthDate ?? ""));
    }
    if (q) {
      db = db.filter(
        (m) =>
          m.familyCode.toLowerCase().includes(q) ||
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q),
      );
    }

    const dbRows: ListRow[] = db.map((member) => ({
      kind: "member",
      member,
    }));

    return [...showcase, ...dbRows];
  }, [chip, members, query]);

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

  const openPerson = (row: ListRow) => {
    if (row.kind === "showcase") {
      if (row.id === SHOWCASE_MARGARET_ID) {
        router.push({
          pathname: "/member/[personId]",
          params: { personId: SHOWCASE_MARGARET_ID },
        });
        return;
      }
      if (row.id === "showcase-kay-hassan") {
        router.push("/(tabs)/account");
        return;
      }
      return;
    }
    router.push({
      pathname: "/member/[personId]",
      params: { personId: row.member.id, code: row.member.familyCode },
    });
  };

  return (
    <Screen testID="members-screen" scroll={false} padded={false} animated={false}>
      <View style={styles.header}>
        <View className="mb-1">
          <AppText variant="titleLarge" className="font-semibold text-foreground">
            Members
          </AppText>
          <AppText variant="labelMedium" className="text-muted-foreground mt-0.5">
            {peopleCountLabel}
          </AppText>
        </View>
        <MembersSearchField
          value={query}
          placeholder="Search members"
          onChangeText={setQuery}
          onSubmit={() => void load(query.trim())}
        />
        <MemberFilterChips value={chip} onChange={setChip} />
      </View>

      {error ? (
        <AppText variant="bodyMedium" style={{ color: theme.colors.error, padding: space.lg }}>
          {error}
        </AppText>
      ) : (
        <FlatList
          testID="members-list"
          data={listRows}
          keyExtractor={(item) =>
            item.kind === "showcase" ? item.id : item.member.id
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          refreshing={loading}
          onRefresh={() => void load(query)}
          renderItem={({ item, index }) => (
            <PersonRow
              testID={index === 0 ? "members-first-card" : undefined}
              initials={
                item.kind === "showcase"
                  ? item.initials
                  : `${item.member.firstName[0] ?? ""}${item.member.lastName[0] ?? ""}`
              }
              name={
                item.kind === "showcase"
                  ? item.name
                  : formatBilingualName(item.member)
              }
              subtitle={
                item.kind === "showcase"
                  ? item.subtitle
                  : `${item.member.familyCode}${
                      item.member.currentCity ? ` · ${item.member.currentCity}` : ""
                    }`
              }
              onPress={() => openPerson(item)}
              onLongPress={
                item.kind === "member" && mode === "local"
                  ? () => onDelete(item.member)
                  : undefined
              }
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
        <FloatingActionButton
          testID="members-add"
          icon="plus"
          accessibilityLabel={copy.members.addMember}
          accessibilityHint={copy.members.newMemberTitle}
          style={{ ...styles.fab, bottom: tabBarHeight + layout.fabOffset }}
          onPress={() => setCreateOpen(true)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: layout.screenPaddingX, paddingTop: space.sm, gap: space.md },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "transparent",
  },
  fab: { position: "absolute", right: layout.screenPaddingX },
});
