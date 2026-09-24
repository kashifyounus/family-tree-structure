import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type ReferenceTextProps = {
  label: string;
  code: string;
};

export function ReferenceText({ label, code }: ReferenceTextProps) {
  const theme = useAppTheme();

  return (
    <View className="mt-1">
      <AppText variant="labelSmall">{label}</AppText>
      <AppText variant="titleSmall" style={{ color: theme.colors.primary }}>
        {code}
      </AppText>
    </View>
  );
}
