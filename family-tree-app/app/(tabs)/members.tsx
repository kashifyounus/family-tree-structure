import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { DemoArchiveBanner } from "@/components/archive/DemoArchiveBanner";
import {
  MemberFilterChips,
  type MemberFilterChip,
} from "@/components/members/MemberFilterChips";
import { MembersSearchField } from "@/components/members/MembersSearchField";
import { PersonRow } from "@/components/members/PersonRow";

import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingView } from "@/components/ui/LoadingView";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAuth } from "@/context/AuthContext";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { listMembers, removeMember } from "@/lib/data/memberRepository";
import type { MemberRecord } from "@/lib/data/types";
import { formatBilingualName } from "@/lib/format/displayName";
import { memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";
import { motion } from "@/theme/motion";
import { layout, space } from "@/theme/tokens";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

export default function MembersScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const router = useRouter();
  const { mode, archiveLane, dataRevision, bumpDataRevision, localMemberCount } =
    useStorage();
  const auth = useAuth();
  const { showError } = useAppFeedback();
  const { impactLight } = useAppPreferences();
  const canCreate =
    mode === "local" ||
    (mode === "online" && auth.token && auth.role !== "VIEWER");
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<MemberFilterChip>("all");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [mode, archiveLane]);

  useEffect(() => {
    void load(query.trim());
  }, [dataRevision, load, archiveLane]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void load(query.trim());
    }, motion.screenEnter);
    return () => clearTimeout(handle);
  }, [query, load]);

  const peopleCountLabel = useMemo(() => {
    const count = mode === "local" ? localMemberCount : members.length;
    return `${count} people`;
  }, [localMemberCount, members.length, mode]);

  const listRows = useMemo((): MemberRecord[] => {
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
    return db;
  }, [chip, members, query]);

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
    <Screen
      testID="members-screen"
      scroll={false}
      padded={false}
      safeTop
      animated={false}
      style={styles.screen}
    >
      {mode === "local" && archiveLane === "demo" && (
        <DemoArchiveBanner testID="members-demo-banner" />
      )}
      <View style={styles.body}>
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
            style={styles.list}
            testID="members-list"
            data={listRows}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: listBottom }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            refreshing={loading}
            onRefresh={() => void load(query)}
            renderItem={({ item, index }) => (
              <PersonRow
                testID={index === 0 ? "members-first-card" : undefined}
                initials={`${item.firstName[0] ?? ""}${item.lastName[0] ?? ""}`}
                name={formatBilingualName(item)}
                nickname={item.nickname}
                subtitle={memberRecordSubtitle(item)}
                onPress={() =>
                  router.push({
                    pathname: "/member/[personId]",
                    params: { personId: item.id, code: item.familyCode },
                  })
                }
                onLongPress={
                  mode === "local" ? () => onDelete(item) : undefined
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="account-multiple-outline"
                title={mode === "local" ? copy.members.emptyPrivate : copy.members.emptyCloud}
                actionLabel={canCreate ? copy.members.addMember : undefined}
                onAction={canCreate ? () => router.push("/add-member") : undefined}
              />
            }
          />
        )}
      </View>

      {canCreate && (
        <FloatingActionButton
          testID="members-add"
          icon="plus"
          accessibilityLabel={copy.members.addMember}
          accessibilityHint={copy.members.newMemberTitle}
          style={{ ...styles.fab, bottom: tabBarHeight + layout.fabOffset }}
          onPress={() => router.push("/add-member")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: space.sm,
    gap: space.md,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: space.xs,
  },
  fab: { position: "absolute", right: layout.screenPaddingX },
});
