import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
import { formatParentLine } from "@/lib/db/parentDisplay";
import { buildLocalReports } from "@/lib/db/localReports";
import { loadRecentPeople, type RecentPerson } from "@/lib/recentPeople";
import { motion } from "@/theme/motion";
import { space } from "@/theme/tokens";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";
import { MembersSearchField } from "@/components/members/MembersSearchField";

export default function HomeScreen() {
  const theme = useAppTheme();
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

      <MembersSearchField
        testID="home-search"
        value={query}
        placeholder={copy.home.searchPlaceholder}
        onChangeText={setQuery}
        onSubmit={() => void runSearch(query)}
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
              <AppText variant="bodyMedium" style={{ color: theme.colors.primary }}>
                {m.firstName} {m.lastName} · {m.familyCode}
              </AppText>
              {m.fatherName || m.motherName ? (
                <AppText variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatParentLine({
                    fatherName: m.fatherName ?? null,
                    motherName: m.motherName ?? null,
                  })}
                </AppText>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {localAccount.session && mode === "local" && (
        <SectionCard>
          <AppText variant="titleMedium">{copy.home.greeting(localAccount.session.displayName)}</AppText>
          <ReferenceText label={copy.account.memberReference} code={localAccount.session.focalFamilyCode} />
          <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: space.sm }}>
            {copy.home.statsPrivate(localMemberCount, living)}
          </AppText>
        </SectionCard>
      )}

      {mode === "online" && cloudStatsLine && (
        <SectionCard>
          <AppText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {cloudStatsLine}
          </AppText>
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
              <AppText variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {r.displayName}
              </AppText>
              <AppText variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {r.familyCode}
              </AppText>
            </Pressable>
          ))}
        </SectionCard>
      )}

      <View style={styles.actions}>
        <Link href="/(tabs)/tree" asChild>
          <ActionTile icon="family-tree" title={copy.home.openTree} />
        </Link>
        <Link href={`/(tabs)/tree?familyCode=${branchReference}`} asChild>
          <ActionTile icon="account-group" title={copy.home.yourBranch} />
        </Link>
        <Link href="/(tabs)/members" asChild>
          <ActionTile testID="home-directory" icon="account-multiple" title={copy.home.directory} />
        </Link>
        <Link href="/(tabs)/reports" asChild>
          <ActionTile icon="chart-bar" title={copy.home.insights} />
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
