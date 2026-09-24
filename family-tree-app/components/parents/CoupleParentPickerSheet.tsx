import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
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
        <AppText variant="bodySmall" className="text-muted-foreground">
          {copy.profile.confirmReplaceParents}
        </AppText>
      ) : null}
      <FormTextInput label="Search couples" value={query} onChangeText={setQuery} />
      <View className="flex-row flex-wrap gap-2">
        <Pressable onPress={() => setActiveOnly((v) => !v)} className="flex-row items-center gap-1">
          <Checkbox isChecked={activeOnly} onChange={setActiveOnly} value="active">
            <CheckboxIndicator>
              <CheckboxIcon />
            </CheckboxIndicator>
            <CheckboxLabel>Active marriages</CheckboxLabel>
          </Checkbox>
        </Pressable>
        <Pressable onPress={() => setLivingOnly((v) => !v)} className="flex-row items-center gap-1">
          <Checkbox isChecked={livingOnly} onChange={setLivingOnly} value="living">
            <CheckboxIndicator>
              <CheckboxIcon />
            </CheckboxIndicator>
            <CheckboxLabel>Living parents only</CheckboxLabel>
          </Checkbox>
        </Pressable>
      </View>
      <View className="flex-row border-b border-border py-1 mt-1">
        <AppText variant="labelSmall" className="flex-[1.4]">Parents</AppText>
        <AppText variant="labelSmall" className="flex-1">Codes</AppText>
        <AppText variant="labelSmall" className="w-7 text-right">Kids</AppText>
      </View>
      {filtered.map((row) => (
        <Pressable
          key={row.unionId}
          onPress={() => onSelectCouple(row)}
          className="flex-row items-center py-1.5 border-b border-border min-h-8 active:bg-muted"
        >
          <AppText variant="bodySmall" numberOfLines={1} className="flex-[1.4] pr-1">
            {formatCoupleLabel(row)}
          </AppText>
          <AppText variant="labelSmall" numberOfLines={1} className="flex-1 text-muted-foreground">
            {row.partner1Code} · {row.partner2Code}
          </AppText>
          <AppText variant="labelSmall" className="w-7 text-right">{row.childCount}</AppText>
        </Pressable>
      ))}
      {filtered.length === 0 ? (
        <AppText variant="bodySmall" className="text-muted-foreground">
          No matching couples. Try another search or add a marriage first.
        </AppText>
      ) : null}
      <AppText variant="labelSmall" className="text-muted-foreground mt-1">
        Tap a row to link this person as their child.
      </AppText>
    </FormBottomSheet>
  );
}
