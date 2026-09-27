import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";
import type { ParentCoupleRow } from "@/lib/db/parentCouples";
import { formatCoupleLabel } from "@/lib/db/parentCouples";
import { CoupleParentPickerRow } from "@/components/parents/CoupleParentPickerRow";

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
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = `${formatCoupleLabel(row)} ${row.partner1Code} ${row.partner2Code}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, rows]);

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
      <FormTextInput
        label={copy.profile.parentCoupleSearchLabel}
        value={query}
        onChangeText={setQuery}
        testID="parent-couple-search"
      />
      <View className="mt-1">
        {filtered.map((row) => (
          <CoupleParentPickerRow
            key={row.unionId}
            row={row}
            onPress={() => onSelectCouple(row)}
          />
        ))}
      </View>
      {filtered.length === 0 ? (
        <AppText variant="bodySmall" className="text-muted-foreground">
          {copy.profile.parentCoupleEmpty}
        </AppText>
      ) : null}
      <Button
        variant="outline"
        className="rounded-full min-h-10 mt-2"
        onPress={() => {
          onDismiss();
          router.push("/add-member");
        }}
      >
        <ButtonText>{copy.profile.parentCreateMemberCta}</ButtonText>
      </Button>
      <AppText variant="labelSmall" className="text-muted-foreground mt-2">
        {copy.profile.parentCoupleTapHint}
      </AppText>
    </FormBottomSheet>
  );
}
