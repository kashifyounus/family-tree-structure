import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { ListRow } from "@/components/ui/ListRow";
import { AppText } from "@/components/ui/AppText";
import { Switch } from "@/components/ui/switch";
type AccountFigmaSectionsProps = {
  privateArchiveOn: boolean;
  onPrivateArchiveChange: (on: boolean) => void;
  onSignOut: () => void;
};

export function AccountFigmaSections({
  privateArchiveOn,
  onPrivateArchiveChange,
  onSignOut,
}: AccountFigmaSectionsProps) {
  const router = useRouter();

  return (
    <View className="gap-6 mb-4">
      <View className="rounded-xl border border-border bg-card px-4">
        <AppText variant="labelMedium" className="text-muted-foreground py-3 uppercase tracking-wide">
          Archive
        </AppText>
        <ListRow
          title="Archive settings"
          description="Household profile and backup"
          leftIcon="archive-outline"
          onPress={() => router.push("/(tabs)/tools")}
        />
        <View className="flex-row items-center justify-between py-3 border-b border-border">
          <View className="flex-1 pr-3">
            <AppText variant="bodyMedium">Private archive</AppText>
            <AppText variant="labelSmall" className="text-muted-foreground mt-0.5">
              Records stay on this device
            </AppText>
          </View>
          <Switch
            value={privateArchiveOn}
            onValueChange={onPrivateArchiveChange}
            accessibilityLabel="Private archive"
          />
        </View>
      </View>

      <View className="rounded-xl border border-border bg-card px-4">
        <AppText variant="labelMedium" className="text-muted-foreground py-3 uppercase tracking-wide">
          Preferences
        </AppText>
        <ListRow
          title="Notifications"
          leftIcon="bell-outline"
          onPress={() => router.push("/notifications")}
        />
        <ListRow
          title="Export data"
          leftIcon="export-variant"
          onPress={() => router.push("/(tabs)/tools")}
        />
        <ListRow
          title="Invite family"
          leftIcon="account-plus-outline"
          onPress={() => {}}
        />
      </View>

      <Pressable
        onPress={onSignOut}
        className="py-3 items-center"
        accessibilityRole="button"
        testID="account-sign-out"
      >
        <AppText variant="bodyMedium" className="text-destructive font-medium">
          Sign out
        </AppText>
      </Pressable>
    </View>
  );
}
