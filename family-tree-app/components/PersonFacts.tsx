import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { formatGender } from "@/lib/format/gender";
import type { MemberRecord } from "@/lib/data/types";

type PersonFactsProps = {
  member: MemberRecord;
};

function FactRow({ label, value }: { label: string; value: string | null | undefined }) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, width: 110 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

export function PersonFacts({ member }: PersonFactsProps) {
  const living =
    !member.deathDate ? "Living" : `Deceased${member.deathDate ? ` · ${member.deathDate}` : ""}`;

  return (
    <View style={styles.wrap}>
      <FactRow label="Gender" value={formatGender(member.gender)} />
      <FactRow label="Date of birth" value={member.birthDate} />
      <FactRow label="Birth place" value={member.birthPlace} />
      <FactRow label="City" value={member.currentCity} />
      <FactRow label="Home town" value={member.homeTown} />
      <FactRow label="Occupation" value={member.occupation} />
      <FactRow label="Status" value={living} />
      {member.bio ? (
        <FactRow label="Notes" value={member.bio} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
});
