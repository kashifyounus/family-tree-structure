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
  suggestNickname?: boolean;
};

export function MemberProfileHero({
  member,
  statusLabel,
  suggestNickname,
}: MemberProfileHeroProps) {
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
      <View className="flex-row flex-wrap items-center justify-center gap-2 px-2">
        <AppText variant="titleLarge" className="font-semibold text-foreground text-center">
          {displayName}
        </AppText>
        {member.nickname?.trim() ? (
          <AppText
            variant="labelMedium"
            className="text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
          >
            {member.nickname.trim()}
          </AppText>
        ) : null}
      </View>
      {lifeLine ? (
        <AppText variant="bodyMedium" className="text-muted-foreground mt-1 text-center">
          {lifeLine}
        </AppText>
      ) : null}
      <Badge className="mt-3" variant="outline">
        <BadgeText>{statusLabel}</BadgeText>
      </Badge>
      {suggestNickname ? (
        <AppText variant="labelSmall" className="text-muted-foreground mt-2 text-center px-4">
          Another living member shares this name — add a nickname to tell them apart.
        </AppText>
      ) : null}
    </View>
  );
}
