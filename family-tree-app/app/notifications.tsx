import { Stack } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Notifications", headerBackTitle: "Home" }} />
      <Screen testID="notifications-screen">
        <EmptyState icon="bell-outline" title={copy.notifications.emptyTitle} />
        <View className="px-6 -mt-4">
          <AppText variant="bodyMedium" className="text-muted-foreground text-center leading-6">
            {copy.notifications.emptyBody}
          </AppText>
        </View>
      </Screen>
    </>
  );
}
