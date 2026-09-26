import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { ActivityRow } from "@/components/home/ActivityRow";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { StatCard } from "@/components/home/StatCard";
import { PersonRow } from "@/components/members/PersonRow";
import { MembersSearchField } from "@/components/members/MembersSearchField";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import { listMembers } from "@/lib/data/memberRepository";
import type { MemberRecord } from "@/lib/data/types";
import { memberInitials, memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";
import {
  greetingForKay,
  mergeShowcaseStats,
  shouldShowShowcaseHome,
  showcaseActivities,
  showcaseUser,
} from "@/lib/mock/kuriosityShowcase";
import { loadRecentPeople, type RecentPerson } from "@/lib/recentPeople";
export default function HomeScreen() {
  const router = useRouter();
  const { mode, localMemberCount, dataRevision } = useStorage();
  const localAccount = useLocalAccount();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MemberRecord[]>([]);
  const [recentPeople, setRecentPeople] = useState<RecentPerson[]>([]);
  const showDemoHome = shouldShowShowcaseHome(localMemberCount, mode);

  const stats = useMemo(() => {
    if (showDemoHome) return mergeShowcaseStats(0);
    if (mode === "local") return mergeShowcaseStats(localMemberCount);
    return null;
  }, [showDemoHome, mode, localMemberCount]);

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

  useEffect(() => {
    if (showDemoHome) {
      setRecentPeople([]);
      return;
    }
    void loadRecentPeople().then(setRecentPeople);
  }, [dataRevision, showDemoHome]);

  return (
    <Screen testID="home-screen" safeTop>
      <HomeTopBar notificationCount={2} />

      <View className="mb-5">
        <AppText variant="titleLarge" className="text-foreground font-semibold">
          {greeting}
        </AppText>
        <AppText variant="bodyMedium" className="text-muted-foreground mt-1">
          Your private family archive
        </AppText>
      </View>

      {stats ? (
        <View className="flex-row gap-2 mb-5">
          <StatCard value={stats.members} label="Members" />
          <StatCard value={stats.generations} label="Generations" />
          <StatCard value={stats.stories} label="Stories" />
        </View>
      ) : (
        <AppText variant="bodySmall" className="text-muted-foreground mb-5">
          Stats reflect your private archive. Switch to private mode to see counts here.
        </AppText>
      )}

      <MembersSearchField
        testID="home-search"
        value={query}
        placeholder="Search people or stories"
        onChangeText={setQuery}
        onSubmit={() => void runSearch(query)}
      />

      {matches.length > 0 && (
        <View className="rounded-xl border border-border bg-card px-3 mt-3 mb-1">
          {matches.map((m) => (
            <PersonRow
              key={m.id}
              initials={memberInitials(`${m.firstName} ${m.lastName}`)}
              name={`${m.firstName} ${m.lastName}`}
              subtitle={memberRecordSubtitle(m)}
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: m.id, code: m.familyCode },
                })
              }
            />
          ))}
        </View>
      )}

      <View className="mt-6 mb-2 flex-row items-center justify-between">
        <View>
          <AppText variant="titleMedium" className="font-semibold">
            {showDemoHome ? "Recent activity" : "Recently viewed"}
          </AppText>
          {showDemoHome ? (
            <AppText variant="labelSmall" className="text-muted-foreground mt-0.5">
              Demo archive preview
            </AppText>
          ) : null}
        </View>
        {showDemoHome ? (
          <Pressable onPress={() => router.push("/notifications")} accessibilityRole="button">
            <AppText variant="labelMedium" className="text-primary">
              See all
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View className="rounded-xl border border-border bg-card px-4 mb-6">
        {showDemoHome ? (
          showcaseActivities.map((item) => (
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
          ))
        ) : recentPeople.length === 0 ? (
          <AppText variant="bodyMedium" className="text-muted-foreground py-4">
            Open a profile from Members or search to see people here.
          </AppText>
        ) : (
          recentPeople.map((person) => (
            <PersonRow
              key={person.personId}
              initials={memberInitials(person.displayName)}
              name={person.displayName}
              subtitle="Recently viewed"
              onPress={() =>
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: person.personId, code: person.familyCode },
                })
              }
            />
          ))
        )}
      </View>

      <PrimaryPillButton
        testID="home-add-member"
        label="Add family member"
        onPress={() => router.push("/add-member")}
      />

      <AppText
        variant="labelSmall"
        className="text-muted-foreground text-center mt-4"
        accessibilityLabel={`Signed in as ${
          localAccount.session?.displayName ?? showcaseUser.displayName
        }`}
      >
        {localAccount.session?.displayName ?? showcaseUser.displayName} · archive owner
      </AppText>

      <View className="h-px w-px overflow-hidden opacity-0">
        <Pressable testID="home-directory" onPress={() => router.push("/(tabs)/members")} />
        <Pressable testID="home-tree" onPress={() => router.push("/(tabs)/tree")} />
        <Pressable testID="home-insights" onPress={() => router.push("/(tabs)/reports")} />
      </View>
    </Screen>
  );
}
