import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type InfoBannerProps = {
  children: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function InfoBanner({ children, icon = "information" }: InfoBannerProps) {
  return (
    <View className="flex-row gap-2 p-3 rounded-xl bg-muted border border-border">
      <MaterialCommunityIcons name={icon} size={20} color="#5c5346" />
      <AppText variant="bodySmall" className="flex-1 text-foreground">
        {children}
      </AppText>
    </View>
  );
}
