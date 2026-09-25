import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { AppText } from "@/components/ui/AppText";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Screen } from "@/components/ui/Screen";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type {
  PersonDetailSegment,
  ShowcasePersonProfile,
} from "@/lib/mock/kuriosityShowcase";
import { useAppTheme } from "@/theme/useAppTheme";

type ShowcasePersonDetailProps = {
  profile: ShowcasePersonProfile;
};

const SEGMENTS: { value: PersonDetailSegment; label: string }[] = [
  { value: "about", label: "About" },
  { value: "photos", label: "Photos" },
  { value: "stories", label: "Stories" },
];

export function ShowcasePersonDetail({ profile }: ShowcasePersonDetailProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const [segment, setSegment] = useState<PersonDetailSegment>("about");

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerBackTitle: "Members",
          headerRight: () => (
            <Pressable accessibilityRole="button" onPress={() => {}}>
              <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
                Edit
              </AppText>
            </Pressable>
          ),
        }}
      />
      <Screen testID="member-profile-screen" bottomInset={88}>
        <View className="items-center mb-5">
          <View className="h-20 w-20 rounded-full bg-primary/15 items-center justify-center mb-3">
            <AppText variant="titleLarge" className="text-primary font-semibold">
              {profile.initials}
            </AppText>
          </View>
          <AppText variant="titleLarge" className="font-semibold text-foreground">
            {profile.displayName}
          </AppText>
          <AppText variant="bodyMedium" className="text-muted-foreground mt-1">
            {profile.lifeLine}
          </AppText>
          <Badge className="mt-3">
            <BadgeText>{profile.relationBadge}</BadgeText>
          </Badge>
        </View>

        <SegmentedControl
          testIdPrefix="person-segment"
          value={segment}
          options={SEGMENTS}
          onChange={setSegment}
        />

        {segment === "about" && (
          <View className="mt-5 gap-4">
            <View className="rounded-xl border border-border bg-card p-4 gap-3">
              <DetailRow label="Born" value={profile.born} />
              {profile.parents.map((p) => (
                <DetailRow key={p.label} label={p.label} value={p.name} link />
              ))}
              <DetailRow label="Sibling" value={profile.sibling} />
              <DetailRow label="Generation" value={profile.generation} />
            </View>
            <View className="rounded-xl border border-border bg-card p-4">
              <AppText variant="labelMedium" className="text-muted-foreground mb-2">
                Bio
              </AppText>
              <AppText variant="bodyMedium" className="text-foreground leading-6">
                {profile.bio}
              </AppText>
            </View>
          </View>
        )}

        {segment === "photos" && (
          <View className="mt-5 gap-3">
            {profile.photos.map((photo) => (
              <View
                key={photo.id}
                className="rounded-xl border border-border bg-muted/30 h-36 justify-end p-3"
              >
                <AppText variant="labelSmall" className="text-muted-foreground">
                  {photo.caption}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {segment === "stories" && (
          <View className="mt-5 gap-2">
            {profile.stories.map((story) => (
              <Pressable
                key={story.id}
                className="rounded-xl border border-border bg-card p-4"
                onPress={() =>
                  router.push({
                    pathname: "/story/[storyId]",
                    params: { storyId: story.id },
                  })
                }
              >
                <AppText variant="bodyMedium" className="font-medium">
                  {story.title}
                </AppText>
                <AppText variant="labelSmall" className="text-muted-foreground mt-1">
                  {story.author}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}

        <View className="flex-row gap-3 mt-8">
          <Button variant="outline" className="flex-1 rounded-full min-h-12">
            <ButtonText>Edit</ButtonText>
          </Button>
          <View className="flex-1">
            <PrimaryPillButton label="Add relation" onPress={() => {}} />
          </View>
        </View>
      </Screen>
    </>
  );
}

function DetailRow({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <View className="flex-row justify-between gap-3">
      <AppText variant="labelMedium" className="text-muted-foreground shrink-0">
        {label}
      </AppText>
      <AppText
        variant="bodyMedium"
        className={`flex-1 text-right ${link ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </AppText>
    </View>
  );
}
