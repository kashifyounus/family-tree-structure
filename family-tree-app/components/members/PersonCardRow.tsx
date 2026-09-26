import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

type PersonCardRowProps = {
  initials: string;
  name: string;
  nickname?: string | null;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
};

export function PersonCardRow({
  initials,
  name,
  nickname,
  subtitle,
  selected,
  onPress,
  testID,
}: PersonCardRowProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="rounded-xl border p-3.5 mb-2 flex-row items-center gap-3"
      style={{
        borderColor: selected ? kuriosityDesign.brand.primary : "#DDD3C4",
        backgroundColor: selected
          ? kuriosityDesign.colors.selectedRowFill
          : kuriosityDesign.brand.primary === "#1B4332"
            ? "#FFFDF8"
            : "#FFFDF8",
        padding: kuriosityDesign.colors.cardPadding,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Avatar className="h-11 w-11 bg-primary/15">
        <AvatarFallbackText className="text-xs text-primary font-semibold">
          {initials}
        </AvatarFallbackText>
      </Avatar>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 flex-wrap">
          <AppText variant="bodyMedium" className="font-medium text-foreground" numberOfLines={1}>
            {name}
          </AppText>
          {nickname?.trim() ? (
            <View className="rounded-full bg-primary/15 px-2 py-0.5">
              <AppText variant="labelSmall" className="text-primary font-medium">
                {nickname.trim()}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="labelSmall" className="text-muted-foreground" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      {selected ? (
        <MaterialCommunityIcons name="check-circle" size={22} color={kuriosityDesign.brand.primary} />
      ) : null}
    </Pressable>
  );
}
