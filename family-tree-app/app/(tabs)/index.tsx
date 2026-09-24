import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Searchbar, Text, useTheme } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";

import { BrandLogo } from "@/components/BrandLogo";
import { ActionTile } from "@/components/ui/ActionTile";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceText } from "@/components/ui/ReferenceText";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { APP_NAME, DEFAULT_FAMILY_CODE } from "@/constants/appMeta";
import { CreditFooter } from "@/components/CreditFooter";
import { copy } from "@/content/businessCopy";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { listMembers } from "@/lib/data/memberRepository";
import type { MemberRecord } from "@/lib/data/types";
import { buildLocalReports } from "@/lib/db/localReports";
import { loadRecentPeople, type RecentPerson } from "@/lib/recentPeople";
import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mode, localMemberCount, apiUrl, dataRevision } = useStorage();
  const localAccount = useLocalAccount();
  const [living, setLiving] = useState(0);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MemberRecord[]>([]);
  const [recent, setRecent] = useState<RecentPerson[]>([]);
  const [cloudMemberCount, setCloudMemberCount] = useState<number | null>(null);
  const [cloudStatsLoading, setCloudStatsLoading] = useState(false);

  useEffect(() => {
    if (mode === "local") {
      setLiving(buildLocalReports().livingCount);
      setCloudMemberCount(null);
    }
  }, [mode, localMemberCount]);

  useEffect(() => {
    void loadRecentPeople().then(setRecent);
  }, [localMemberCount]);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setMatches([]);
        return;
      }
      const all = await listMembers(mode, trimmed);
      const lower = trimmed.toLowerCase();
      setMatches(
        all
          .filter(
            (m) =>
              m.familyCode.toLowerCase().includes(lower) ||
              m.firstName.toLowerCase().includes(lower) ||
              m.lastName.toLowerCase().includes(lower),
          )
          .slice(0, 6),
      );
    },
    [mode, apiUrl],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      void runSearch(trimmed);
    }, 320);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  const branchReference =
    mode === "local" && localAccount.session
      ? localAccount.session.focalFamilyCode
      : DEFAULT_FAMILY_CODE;

  useEffect(() => {
    if (mode !== "online") return;
    setCloudStatsLoading(true);
    void listMembers("online")
      .then((list) => setCloudMemberCount(list.length))
      .catch(() => setCloudMemberCount(null))
      .finally(() => setCloudStatsLoading(false));
  }, [mode, localMemberCount, apiUrl, dataRevision]);

  const cloudStatsLine = useMemo(() => {
    if (mode !== "online") return null;
    if (cloudStatsLoading) return copy.home.statsCloudLoading;
    if (cloudMemberCount == null) return null;
    return copy.home.statsCloud(cloudMemberCount, branchReference);
  }, [mode, cloudStatsLoading, cloudMemberCount, branchReference]);

  return (
    <Screen testID="home-screen">
      <Animated.View entering={FadeIn.duration(motion.slow)} style={styles.hero}>
        <BrandLogo size={80} />
        <CreditFooter showVersion={false} />
      </Animated.View>

      <PageHeader title={APP_NAME} subtitle={copy.app.tagline} />

      <Searchbar
        testID="home-search"
        placeholder={copy.home.searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => void runSearch(query)}
        onIconPress={() => void runSearch(query)}
        style={{ marginBottom: space.sm, backgroundColor: theme.colors.surfaceVariant }}
      />
      {matches.length > 0 && (
        <View style={styles.matchList}>
          {matches.map((m) => (
            <Pressable
              key={m.id}
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: m.id, code: m.familyCode },
                })
              }
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                {m.firstName} {m.lastName} · {m.familyCode}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {localAccount.session && mode === "local" && (
        <SectionCard>
          <Text variant="titleMedium">{copy.home.greeting(localAccount.session.displayName)}</Text>
          <ReferenceText label={copy.account.memberReference} code={localAccount.session.focalFamilyCode} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: space.sm }}>
            {copy.home.statsPrivate(localMemberCount, living)}
          </Text>
        </SectionCard>
      )}

      {mode === "online" && cloudStatsLine && (
        <SectionCard>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {cloudStatsLine}
          </Text>
        </SectionCard>
      )}

      {recent.length > 0 && (
        <SectionCard title={copy.home.recentTitle}>
          {recent.map((r) => (
            <Pressable
              key={r.personId}
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: r.personId, code: r.familyCode },
                })
              }
              style={{ paddingVertical: 6 }}
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {r.displayName}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {r.familyCode}
              </Text>
            </Pressable>
          ))}
        </SectionCard>
      )}

      <View style={styles.actions}>
        <Link href="/(tabs)/tree" asChild>
          <ActionTile icon="family-tree" mode="contained">
            {copy.home.openTree}
          </ActionTile>
        </Link>
        <Link href={`/(tabs)/tree?familyCode=${branchReference}`} asChild>
          <ActionTile icon="account-group">
            {copy.home.yourBranch}
          </ActionTile>
        </Link>
        <Link href="/(tabs)/members" asChild>
          <ActionTile testID="home-directory" icon="account-multiple">
            {copy.home.directory}
          </ActionTile>
        </Link>
        <Link href="/(tabs)/reports" asChild>
          <ActionTile icon="chart-bar">
            {copy.home.insights}
          </ActionTile>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: space.md },
  actions: { gap: space.md, marginTop: space.sm },
  matchList: { gap: 8, marginBottom: space.md },
});
