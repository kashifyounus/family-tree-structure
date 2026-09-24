import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, type ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

type FloatingActionButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  testID?: string;
  style?: ViewStyle;
};

export function FloatingActionButton({
  icon,
  onPress,
  testID,
  style,
}: FloatingActionButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      className="h-14 w-14 rounded-full items-center justify-center shadow-md"
      style={[{ backgroundColor: theme.colors.primary }, style]}
    >
      <MaterialCommunityIcons name={icon} size={26} color={theme.colors.onPrimary} />
    </Pressable>
  );
}
