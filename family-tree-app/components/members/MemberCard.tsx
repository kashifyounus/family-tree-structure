import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { formatBilingualName } from "@/lib/format/displayName";
import { formatParentLine } from "@/lib/db/parentDisplay";
import { memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";
import type { MemberRecord } from "@/lib/data/types";
import { useAppTheme } from "@/theme/useAppTheme";
import { layout, radius, space } from "@/theme/tokens";

type MemberCardProps = {
  member: MemberRecord;
  testID?: string;
  onPress: () => void;
  onLongPress?: () => void;
};

export function MemberCard({
  member,
  testID,
  onPress,
  onLongPress,
}: MemberCardProps) {
  const theme = useAppTheme();
  const title = formatBilingualName(member);
  const initials = `${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Avatar className="h-11 w-11 bg-primary/15">
        <AvatarFallbackText>{initials || "?"}</AvatarFallbackText>
      </Avatar>
      <View style={styles.body}>
        <AppText variant="titleSmall" numberOfLines={2}>{title}</AppText>
        <AppText variant="bodySmall" className="mt-0.5">
          {memberRecordSubtitle(member)}
        </AppText>
        {member.fatherName || member.motherName ? (
          <AppText variant="labelSmall" numberOfLines={1} className="mt-0.5">
            {formatParentLine({
              fatherName: member.fatherName ?? null,
              motherName: member.motherName ?? null,
            })}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: layout.listGap,
  },
  body: { flex: 1, minWidth: 0 },
});
