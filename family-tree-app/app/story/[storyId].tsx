import { Pressable, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Screen } from "@/components/ui/Screen";
import { showcaseStoryLahore } from "@/lib/mock/kuriosityShowcase";
import { useAppTheme } from "@/theme/useAppTheme";

export default function StoryDetailScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const theme = useAppTheme();
  const story =
    storyId === showcaseStoryLahore.id ? showcaseStoryLahore : showcaseStoryLahore;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Story",
          headerRight: () => (
            <Pressable accessibilityRole="button">
              <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
                Share
              </AppText>
            </Pressable>
          ),
        }}
      />
      <Screen>
        <AppText variant="headlineSmall" className="text-foreground font-semibold mb-1">
          {story.title}
        </AppText>
        <AppText variant="labelMedium" className="text-muted-foreground mb-4">
          {story.author}
        </AppText>
        <View className="rounded-xl border border-border bg-muted/30 h-48 items-center justify-center mb-2">
          <AppText variant="labelSmall" className="text-muted-foreground">
            Family photo
          </AppText>
        </View>
        <AppText variant="labelSmall" className="text-muted-foreground mb-5 italic">
          {story.caption}
        </AppText>
        {story.paragraphs.map((p, i) => (
          <AppText key={i} variant="bodyMedium" className="text-foreground mb-4 leading-6">
            {p}
          </AppText>
        ))}
        <AppText variant="labelMedium" className="text-muted-foreground mb-2">
          Related people
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {story.relatedPeople.map((name) => (
            <Badge key={name} variant="outline">
              <BadgeText>{name}</BadgeText>
            </Badge>
          ))}
        </View>
      </Screen>
    </>
  );
}
