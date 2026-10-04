import { Stack } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";

export default function StoryDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Story" }} />
      <Screen testID="story-screen">
        <EmptyState icon="book-open-page-variant" title={copy.stories.emptyTitle} />
        <View className="px-6 -mt-4">
          <AppText variant="bodyMedium" className="text-muted-foreground text-center leading-6">
            {copy.stories.emptyBody}
          </AppText>
        </View>
      </Screen>
    </>
  );
}
