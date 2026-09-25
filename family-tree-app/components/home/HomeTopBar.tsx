import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { BrandLogo } from "@/components/BrandLogo";
import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { showcaseUser } from "@/lib/mock/kuriosityShowcase";
import { useAppTheme } from "@/theme/useAppTheme";

type HomeTopBarProps = {
  notificationCount?: number;
};

export function HomeTopBar({ notificationCount = 2 }: HomeTopBarProps) {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 mb-4">
      <BrandLogo size={44} showTitle={false} />
      <View className="flex-1">
        <AppText variant="titleMedium" className="text-foreground leading-tight">
          Kuriosity
        </AppText>
        <AppText variant="labelSmall" className="text-muted-foreground">
          Family Tree
        </AppText>
      </View>
      <Pressable
        onPress={() => router.push("/notifications")}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        className="p-2"
        testID="home-notifications"
      >
        <View>
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color={theme.colors.onSurface}
          />
          {notificationCount > 0 ? (
            <View
              className="absolute -right-1 -top-1 min-w-[18px] h-[18px] rounded-full bg-primary items-center justify-center px-1"
              accessibilityLabel={`${notificationCount} unread notifications`}
            >
              <AppText variant="labelSmall" className="text-primary-foreground text-[11px]">
                {notificationCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Avatar className="h-10 w-10 bg-primary/15">
        <AvatarFallbackText className="text-primary font-semibold">
          {showcaseUser.initials}
        </AvatarFallbackText>
      </Avatar>
    </View>
  );
}
