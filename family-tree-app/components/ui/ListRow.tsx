import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type ListRowProps = {
  title: string;
  description?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  testID?: string;
};

export function ListRow({
  title,
  description,
  leftIcon = "account",
  onPress,
  testID,
}: ListRowProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 border-b border-border"
    >
      <MaterialCommunityIcons name={leftIcon} size={22} color={theme.colors.primary} />
      <View className="flex-1 min-w-0">
        <AppText variant="bodyMedium">{title}</AppText>
        {description ? (
          <AppText variant="bodySmall" className="text-muted-foreground">
            {description}
          </AppText>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}
