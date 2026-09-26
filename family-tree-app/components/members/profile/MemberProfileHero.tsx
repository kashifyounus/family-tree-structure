import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import type { MemberRecord } from "@/lib/data/types";
import { formatDisplayDate } from "@/lib/format/displayDate";
import { formatBilingualName } from "@/lib/format/displayName";
import { memberInitials } from "@/lib/members/memberPickerSubtitle";

type MemberProfileHeroProps = {
  member: MemberRecord;
  statusLabel: string;
};

export function MemberProfileHero({ member, statusLabel }: MemberProfileHeroProps) {
  const displayName = formatBilingualName(member);
  const born = formatDisplayDate(member.birthDate);
  const lifeLine = [born ? `Born ${born}` : null, member.currentCity?.trim() || null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="items-center mb-4">
      <Avatar className="h-20 w-20 bg-primary/15 mb-3">
        <AvatarFallbackText className="text-lg text-primary font-semibold">
          {memberInitials(`${member.firstName} ${member.lastName}`)}
        </AvatarFallbackText>
      </Avatar>
      <AppText variant="titleLarge" className="font-semibold text-foreground text-center">
        {displayName}
      </AppText>
      {lifeLine ? (
        <AppText variant="bodyMedium" className="text-muted-foreground mt-1 text-center">
          {lifeLine}
        </AppText>
      ) : null}
      <Badge className="mt-3" variant="outline">
        <BadgeText>{statusLabel}</BadgeText>
      </Badge>
    </View>
  );
}
