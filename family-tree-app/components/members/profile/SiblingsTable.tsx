import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { formatDisplayDate } from "@/lib/format/displayDate";
import type { KinshipRelative } from "@/lib/kinship/types";

type SiblingsTableProps = {
  siblings: KinshipRelative[];
  onPressSibling?: (personId: string, familyCode: string) => void;
};

function statusLabel(sibling: KinshipRelative): string {
  if (sibling.deathDate) return "Deceased";
  return "Living";
}

export function SiblingsTable({ siblings, onPressSibling }: SiblingsTableProps) {
  if (siblings.length === 0) {
    return (
      <AppText variant="bodyMedium" className="text-muted-foreground">
        No full siblings recorded.
      </AppText>
    );
  }

  return (
    <View className="rounded-xl border border-border bg-card overflow-hidden">
      <View className="flex-row border-b border-border bg-muted/30 px-3.5 py-2">
        <AppText variant="labelSmall" className="flex-[1.4] font-semibold text-muted-foreground">
          Name
        </AppText>
        <AppText variant="labelSmall" className="flex-1 font-semibold text-muted-foreground">
          Born
        </AppText>
        <AppText variant="labelSmall" className="w-16 text-right font-semibold text-muted-foreground">
          Status
        </AppText>
      </View>
      {siblings.map((sibling) => {
        const name = `${sibling.firstName} ${sibling.lastName}`.trim();
        const born = formatDisplayDate(sibling.birthDate) ?? "—";
        return (
          <Pressable
            key={sibling.id}
            onPress={() => onPressSibling?.(sibling.id, sibling.familyCode)}
            className="flex-row items-center px-3.5 py-2.5 border-b border-border active:bg-muted/40"
          >
            <AppText variant="bodyMedium" className="flex-[1.4] text-foreground pr-2" numberOfLines={1}>
              {name}
            </AppText>
            <AppText variant="labelSmall" className="flex-1 text-muted-foreground" numberOfLines={1}>
              {born}
            </AppText>
            <AppText variant="labelSmall" className="w-16 text-right text-muted-foreground">
              {statusLabel(sibling)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
