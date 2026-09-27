import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { formatDisplayDate } from "@/lib/format/displayDate";
import type { ParentCoupleRow } from "@/lib/db/parentCouples";
import { orderedCouplePartners } from "@/lib/db/parentCouples";
import { memberInitials } from "@/lib/members/memberPickerSubtitle";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";
import { formatPersonDisplayName } from "../../../shared/unknownCoParent";

type CoupleParentPickerRowProps = {
  row: ParentCoupleRow;
  onPress: () => void;
};

function MiniPartner({
  name,
  familyCode,
}: {
  name: string;
  familyCode: string;
}) {
  const display = formatPersonDisplayName({
    firstName: name.split(" ")[0] ?? name,
    lastName: name.split(" ").slice(1).join(" "),
    familyCode,
  });
  return (
    <View className="flex-1 flex-row items-center gap-2 min-w-0">
      <Avatar className="h-9 w-9 bg-primary/10">
        <AvatarFallbackText className="text-[10px] text-primary font-semibold">
          {memberInitials(display)}
        </AvatarFallbackText>
      </Avatar>
      <AppText variant="bodySmall" className="font-medium text-foreground flex-1" numberOfLines={2}>
        {display}
      </AppText>
    </View>
  );
}

export function CoupleParentPickerRow({ row, onPress }: CoupleParentPickerRowProps) {
  const { husband, wife } = orderedCouplePartners(row);
  const wedding = formatDisplayDate(row.marriageDate ?? undefined);

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-border mb-2 active:bg-muted"
      style={{
        backgroundColor: "#FFFDF8",
        padding: kuriosityDesign.colors.cardPadding,
      }}
    >
      <View className="flex-row items-center gap-2">
        <MiniPartner name={husband.name} familyCode={husband.familyCode} />
        <AppText variant="labelSmall" className="text-muted-foreground px-0.5">
          |
        </AppText>
        <MiniPartner name={wife.name} familyCode={wife.familyCode} />
      </View>
      <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
        <AppText variant="labelSmall" className="text-muted-foreground">
          {wedding || "Marriage date unknown"}
        </AppText>
        <AppText variant="labelSmall" className="text-muted-foreground">
          {row.childCount} {row.childCount === 1 ? "child" : "children"}
        </AppText>
      </View>
    </Pressable>
  );
}
