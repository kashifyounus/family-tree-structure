import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { useAppTheme } from "@/theme/useAppTheme";

type PersonRowProps = {
  initials: string;
  name: string;
  subtitle: string;
  onPress: () => void;
  onLongPress?: () => void;
  testID?: string;
};

export function PersonRow({
  initials,
  name,
  subtitle,
  onPress,
  onLongPress,
  testID,
}: PersonRowProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center gap-3 py-3.5 border-b border-border/80 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subtitle}`}
    >
      <Avatar className="h-11 w-11 bg-primary/15">
        <AvatarFallbackText className="text-primary text-xs font-semibold">
          {initials}
        </AvatarFallbackText>
      </Avatar>
      <View className="flex-1 min-w-0 gap-0.5">
        <AppText variant="bodyMedium" className="text-foreground font-medium" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="labelSmall" className="text-muted-foreground" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}
