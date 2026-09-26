import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { PersonCardRow } from "@/components/members/PersonCardRow";
import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import {
  memberInitials,
  memberPickerSubtitle,
  type BriefMemberRow,
} from "@/lib/members/memberPickerSubtitle";

export type BriefMember = BriefMemberRow;

type ExistingMemberPickerProps = {
  members: BriefMember[];
  excludeIds?: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function ExistingMemberPicker({
  members,
  excludeIds = [],
  selectedId,
  onSelect,
}: ExistingMemberPickerProps) {
  const [query, setQuery] = useState("");

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => !excluded.has(m.id))
      .filter((m) => {
        if (!q) return true;
        const subtitle = memberPickerSubtitle(m);
        return (
          m.name.toLowerCase().includes(q) ||
          subtitle.toLowerCase().includes(q) ||
          m.familyCode.toLowerCase().includes(q)
        );
      })
      .slice(0, 48);
  }, [excluded, members, query]);

  return (
    <View className="gap-2">
      <FormTextInput
        label={copy.profile.pickMemberSearch}
        value={query}
        onChangeText={setQuery}
      />
      <ScrollView
        style={{ maxHeight: 260 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {filtered.map((m) => {
          const selected = m.id === selectedId;
          return (
            <PersonCardRow
              key={m.id}
              testID={`member-picker-${m.familyCode}`}
              initials={memberInitials(m.name)}
              name={m.name}
              subtitle={memberPickerSubtitle(m)}
              selected={selected}
              onPress={() => onSelect(m.id)}
            />
          );
        })}
        {filtered.length === 0 ? (
          <AppText variant="bodySmall" className="text-muted-foreground">
            {copy.profile.noPickerMatches}
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}
