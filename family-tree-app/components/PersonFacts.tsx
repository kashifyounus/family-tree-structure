import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { formatGender } from "@/lib/format/gender";
import type { MemberRecord } from "@/lib/data/types";

type PersonFactsProps = {
  member: MemberRecord;
};

function FactRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <AppText variant="labelMedium" className="w-28 text-muted-foreground">{label}</AppText>
      <AppText variant="bodyMedium" className="flex-1">{value}</AppText>
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
      {member.bio ? <FactRow label="Notes" value={member.bio} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 12 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
});
