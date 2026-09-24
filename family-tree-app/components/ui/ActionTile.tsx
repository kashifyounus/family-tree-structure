import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type ActionTileProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  testID?: string;
};

export function ActionTile({ icon, title, subtitle, onPress, testID }: ActionTileProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="flex-row items-center gap-3 p-4 rounded-2xl border border-border bg-card"
    >
      <View className="h-10 w-10 rounded-full items-center justify-center bg-primary/10">
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View className="flex-1 min-w-0">
        <AppText variant="titleSmall">{title}</AppText>
        {subtitle ? (
          <AppText variant="bodySmall" className="text-muted-foreground">{subtitle}</AppText>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}
