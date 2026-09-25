import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
  outlineName: keyof typeof MaterialCommunityIcons.glyphMap;
  filledName: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function TabBarIcon({
  focused,
  color,
  size,
  outlineName,
  filledName,
}: TabBarIconProps) {
  const theme = useAppTheme();
  const iconName = focused ? filledName : outlineName;
  const tint = focused ? theme.colors.primary : color;

  return (
    <View className="items-center justify-center pt-1">
      <MaterialCommunityIcons name={iconName} size={size} color={tint} />
      {focused ? (
        <View
          className="h-1 w-1 rounded-full mt-1"
          style={{ backgroundColor: theme.colors.primary }}
        />
      ) : (
        <View className="h-1 w-1 mt-1" />
      )}
    </View>
  );
}
