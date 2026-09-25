import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { HomeActivity } from "@/lib/mock/kuriosityShowcase";
import { useAppTheme } from "@/theme/useAppTheme";

type ActivityRowProps = {
  item: HomeActivity;
  onPress?: () => void;
};

export function ActivityRow({ item, onPress }: ActivityRowProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 border-b border-border/80"
      accessibilityRole="button"
    >
      <Avatar className="h-11 w-11 bg-secondary">
        <AvatarFallbackText className="text-foreground text-xs">
          {item.initials}
        </AvatarFallbackText>
      </Avatar>
      <View className="flex-1 gap-0.5">
        <AppText variant="bodyMedium" className="text-foreground">
          {item.title}
        </AppText>
        <AppText variant="labelSmall" className="text-muted-foreground">
          {item.subtitle}
        </AppText>
      </View>
      <AppText variant="labelSmall" className="text-muted-foreground">
        {item.timeAgo}
      </AppText>
      {onPress ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      ) : null}
    </Pressable>
  );
}
