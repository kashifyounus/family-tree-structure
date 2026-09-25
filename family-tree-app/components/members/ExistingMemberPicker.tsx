import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import { useAppTheme } from "@/theme/useAppTheme";

export type BriefMember = {
  id: string;
  name: string;
  familyCode: string;
};

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
  const theme = useAppTheme();
  const [query, setQuery] = useState("");

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => !excluded.has(m.id))
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.familyCode.toLowerCase().includes(q)
        );
      })
      .slice(0, 48);
  }, [excluded, members, query]);

  return (
    <View style={styles.wrap}>
      <FormTextInput
        label={copy.profile.pickMemberSearch}
        value={query}
        onChangeText={setQuery}
      />
      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {filtered.map((m) => {
          const selected = m.id === selectedId;
          return (
            <Pressable
              key={m.id}
              testID={`member-picker-${m.familyCode}`}
              accessibilityLabel={`${m.name}, ${m.familyCode}`}
              onPress={() => onSelect(m.id)}
              style={[
                styles.row,
                {
                  backgroundColor: selected
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              <AppText variant="bodyMedium">{m.name}</AppText>
              <AppText
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {m.familyCode}
              </AppText>
            </Pressable>
          );
        })}
        {filtered.length === 0 ? (
          <AppText
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {copy.profile.noPickerMatches}
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  list: { maxHeight: 220 },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
});
