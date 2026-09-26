import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { formatDisplayDate } from "@/lib/format/displayDate";
import { memberInitials } from "@/lib/members/memberPickerSubtitle";

type SpousePillProps = {
  spouseName: string;
  marriageDate?: string | null;
  onPress?: () => void;
};

export function SpousePill({ spouseName, marriageDate, onPress }: SpousePillProps) {
  const wedding = formatDisplayDate(marriageDate ?? undefined);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="rounded-full border border-border bg-card flex-row items-center gap-2 px-3 py-2 self-center"
      accessibilityRole={onPress ? "button" : "text"}
    >
      <Avatar className="h-8 w-8 bg-primary/15">
        <AvatarFallbackText className="text-[10px] text-primary font-semibold">
          {memberInitials(spouseName)}
        </AvatarFallbackText>
      </Avatar>
      <View>
        <AppText variant="labelMedium" className="text-foreground font-medium">
          Married to {spouseName}
        </AppText>
        {wedding ? (
          <AppText variant="labelSmall" className="text-muted-foreground">
            {wedding}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
