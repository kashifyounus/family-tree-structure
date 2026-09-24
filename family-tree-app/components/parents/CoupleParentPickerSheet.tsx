import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Checkbox, Text, useTheme } from "react-native-paper";

import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import type { ParentCoupleRow } from "@/lib/db/parentCouples";
import { formatCoupleLabel } from "@/lib/db/parentCouples";

type CoupleParentPickerSheetProps = {
  visible: boolean;
  title: string;
  rows: ParentCoupleRow[];
  replacingExisting: boolean;
  onDismiss: () => void;
  onSelectCouple: (row: ParentCoupleRow) => void;
};

export function CoupleParentPickerSheet({
  visible,
  title,
  rows,
  replacingExisting,
  onDismiss,
  onSelectCouple,
}: CoupleParentPickerSheetProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [livingOnly, setLivingOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (activeOnly && !row.isActive) return false;
      if (!q) return true;
      const hay = `${formatCoupleLabel(row)} ${row.partner1Code} ${row.partner2Code}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeOnly, query, rows]);

  return (
    <FormBottomSheet
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      hideActions
      cancelLabel={copy.reports.cancel}
    >
      {replacingExisting ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {copy.profile.confirmReplaceParents}
        </Text>
      ) : null}
      <FormTextInput label="Search couples" value={query} onChangeText={setQuery} />
      <View style={styles.filters}>
        <Pressable onPress={() => setActiveOnly((v) => !v)} style={styles.filterRow}>
          <Checkbox status={activeOnly ? "checked" : "unchecked"} />
          <Text variant="labelMedium">Active marriages</Text>
        </Pressable>
        <Pressable onPress={() => setLivingOnly((v) => !v)} style={styles.filterRow}>
          <Checkbox status={livingOnly ? "checked" : "unchecked"} />
          <Text variant="labelMedium">Living parents only</Text>
        </Pressable>
      </View>
      <View style={[styles.tableHead, { borderColor: theme.colors.outlineVariant }]}>
        <Text variant="labelSmall" style={styles.colParents}>Parents</Text>
        <Text variant="labelSmall" style={styles.colCodes}>Codes</Text>
        <Text variant="labelSmall" style={styles.colKids}>Kids</Text>
      </View>
      {filtered.map((row) => (
        <Pressable
          key={row.unionId}
          onPress={() => onSelectCouple(row)}
          style={({ pressed }) => [
            styles.row,
            {
              borderColor: theme.colors.outlineVariant,
              backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
            },
          ]}
        >
          <Text variant="bodySmall" numberOfLines={1} style={styles.colParents}>
            {formatCoupleLabel(row)}
          </Text>
          <Text variant="labelSmall" numberOfLines={1} style={[styles.colCodes, { color: theme.colors.onSurfaceVariant }]}>
            {row.partner1Code} · {row.partner2Code}
          </Text>
          <Text variant="labelSmall" style={styles.colKids}>{row.childCount}</Text>
        </Pressable>
      ))}
      {filtered.length === 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          No matching couples. Try another search or add a marriage first.
        </Text>
      ) : null}
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
        Tap a row to link this person as their child.
      </Text>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterRow: { flexDirection: "row", alignItems: "center" },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 32,
  },
  colParents: { flex: 1.4, paddingRight: 6 },
  colCodes: { flex: 1, paddingRight: 6 },
  colKids: { width: 28, textAlign: "right" },
});
