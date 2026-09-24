import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";

import { formatBilingualName } from "@/lib/format/displayName";
import { formatParentLine } from "@/lib/db/parentDisplay";
import { formatGender } from "@/lib/format/gender";
import type { MemberRecord } from "@/lib/data/types";
import { layout, radius, space } from "@/theme/tokens";

type MemberCardProps = {
  member: MemberRecord;
  testID?: string;
  onPress: () => void;
  onLongPress?: () => void;
};

function genderIcon(gender: MemberRecord["gender"]): string {
  if (gender === "FEMALE") return "gender-female";
  if (gender === "MALE") return "gender-male";
  return "account";
}

export function MemberCard({
  member,
  testID,
  onPress,
  onLongPress,
}: MemberCardProps) {
  const theme = useTheme();
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
      <Avatar.Text
        size={44}
        label={initials || "?"}
        style={{ backgroundColor: theme.colors.primaryContainer }}
      />
      <View style={styles.body}>
        <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {member.familyCode} · {formatGender(member.gender)}
          {member.currentCity ? ` · ${member.currentCity}` : ""}
        </Text>
        {member.fatherName || member.motherName ? (
          <Text
            variant="labelSmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          >
            {formatParentLine({
              fatherName: member.fatherName ?? null,
              motherName: member.motherName ?? null,
            })}
          </Text>
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
