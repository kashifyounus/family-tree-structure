import { View, type ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

type ProgressBarProps = {
  progress: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const theme = useAppTheme();
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[
        {
          height: 6,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: theme.colors.surfaceVariant,
        },
        style,
      ]}
    >
      <View
        style={{
          height: "100%",
          width: `${clamped * 100}%`,
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
