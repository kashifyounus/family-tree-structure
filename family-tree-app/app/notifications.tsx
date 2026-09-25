import { Pressable, SectionList, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Screen } from "@/components/ui/Screen";
import {
  showcaseNotifications,
  type ShowcaseNotification,
} from "@/lib/mock/kuriosityShowcase";
import { useAppTheme } from "@/theme/useAppTheme";

type Section = { title: string; data: ShowcaseNotification[] };

const sections: Section[] = [
  {
    title: "Today",
    data: showcaseNotifications.filter((n) => n.section === "Today"),
  },
  {
    title: "Earlier",
    data: showcaseNotifications.filter((n) => n.section === "Earlier"),
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerBackTitle: "Home",
          headerRight: () => (
            <Pressable onPress={() => {}} accessibilityRole="button">
              <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
                Mark all
              </AppText>
            </Pressable>
          ),
        }}
      />
      <Screen scroll={false} padded={false}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderSectionHeader={({ section: { title } }) => (
            <AppText
              variant="labelMedium"
              className="text-muted-foreground pt-4 pb-2 uppercase tracking-wide"
            >
              {title}
            </AppText>
          )}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-start gap-3 py-3 border-b border-border/80"
              onPress={() => {
                if (item.subtitle.includes("Lahore")) {
                  router.push({
                    pathname: "/story/[storyId]",
                    params: { storyId: "lahore-wedding" },
                  });
                }
              }}
            >
              <Avatar className="h-11 w-11 bg-secondary mt-0.5">
                <AvatarFallbackText className="text-xs">{item.initials}</AvatarFallbackText>
              </Avatar>
              <View className="flex-1 gap-0.5">
                <AppText variant="bodyMedium">{item.title}</AppText>
                <AppText variant="labelSmall" className="text-muted-foreground">
                  {item.subtitle}
                </AppText>
                <AppText variant="labelSmall" className="text-muted-foreground mt-1">
                  {item.time}
                </AppText>
              </View>
              {item.unread ? (
                <View className="h-2.5 w-2.5 rounded-full bg-primary mt-2" />
              ) : null}
            </Pressable>
          )}
        />
      </Screen>
    </>
  );
}
