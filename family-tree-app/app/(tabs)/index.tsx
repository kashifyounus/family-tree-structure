import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ActivityRow } from "@/components/home/ActivityRow";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { StatCard } from "@/components/home/StatCard";
import { MembersSearchField } from "@/components/members/MembersSearchField";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { listMembers } from "@/lib/data/memberRepository";
import type { MemberRecord } from "@/lib/data/types";
import { formatParentLine } from "@/lib/db/parentDisplay";
import {
  greetingForKay,
  mergeShowcaseStats,
  showcaseActivities,
  showcaseUser,
} from "@/lib/mock/kuriosityShowcase";
import { space } from "@/theme/tokens";
import { useAppTheme } from "@/theme/useAppTheme";

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { mode, localMemberCount } = useStorage();
  const localAccount = useLocalAccount();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MemberRecord[]>([]);

  const stats = useMemo(
    () => mergeShowcaseStats(mode === "local" ? localMemberCount : 48),
    [mode, localMemberCount],
  );

  const greeting = useMemo(() => {
    const name = localAccount.session?.displayName?.split(" ")[0];
    if (name) {
      const hour = new Date().getHours();
      const period =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      return `${period}, ${name}`;
    }
    return greetingForKay();
  }, [localAccount.session?.displayName]);

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
    [mode],
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

  return (
    <Screen testID="home-screen">
      <HomeTopBar notificationCount={2} />

      <View className="mb-5">
        <AppText variant="titleLarge" className="text-foreground font-semibold">
          {greeting}
        </AppText>
        <AppText variant="bodyMedium" className="text-muted-foreground mt-1">
          Your private family archive
        </AppText>
      </View>

      <View className="flex-row gap-2 mb-5">
        <StatCard value={stats.members} label="Members" />
        <StatCard value={stats.generations} label="Generations" />
        <StatCard value={stats.stories} label="Stories" />
      </View>

      <MembersSearchField
        testID="home-search"
        value={query}
        placeholder="Search people or stories"
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

      <View className="mt-6 mb-2 flex-row items-center justify-between">
        <AppText variant="titleMedium" className="font-semibold">
          Recent activity
        </AppText>
        <Pressable onPress={() => router.push("/notifications")} accessibilityRole="button">
          <AppText variant="labelMedium" className="text-primary">
            See all
          </AppText>
        </Pressable>
      </View>

      <View className="rounded-xl border border-border bg-card px-4 mb-6">
        {showcaseActivities.map((item) => (
          <ActivityRow
            key={item.id}
            item={item}
            onPress={
              item.id === "a3"
                ? () =>
                    router.push({
                      pathname: "/story/[storyId]",
                      params: { storyId: "lahore-wedding" },
                    })
                : undefined
            }
          />
        ))}
      </View>

      <PrimaryPillButton
        testID="home-add-member"
        label="Add family member"
        onPress={() => router.push("/add-member")}
      />

      <AppText
        variant="labelSmall"
        className="text-muted-foreground text-center mt-4"
        accessibilityLabel={`Signed in as ${showcaseUser.displayName}`}
      >
        {showcaseUser.displayName} · archive owner
      </AppText>

      <View className="h-px w-px overflow-hidden opacity-0">
        <Pressable testID="home-directory" onPress={() => router.push("/(tabs)/members")} />
        <Pressable testID="home-tree" onPress={() => router.push("/(tabs)/tree")} />
        <Pressable testID="home-insights" onPress={() => router.push("/(tabs)/reports")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  matchList: { gap: 8, marginTop: space.md, marginBottom: space.sm },
});
