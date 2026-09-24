import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

type IconButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
  size?: number;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  testID,
  size = 24,
}: IconButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="p-2 rounded-full"
    >
      <MaterialCommunityIcons name={icon} size={size} color={theme.colors.onSurface} />
    </Pressable>
  );
}
