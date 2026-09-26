import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import type { UnionChildView } from "@/lib/data/types";
import { formatDisplayDate } from "@/lib/format/displayDate";

type MarriageChildrenListProps = {
  unionChildren: UnionChildView[];
  onPressChild?: (personId: string, familyCode: string) => void;
};

function statusLabel(child: UnionChildView): string {
  if (child.deathDate) return "Deceased";
  return "Living";
}

export function MarriageChildrenList({ unionChildren, onPressChild }: MarriageChildrenListProps) {
  if (unionChildren.length === 0) {
    return null;
  }

  return (
    <View className="mt-2 rounded-xl border border-border bg-card overflow-hidden">
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
      {unionChildren.map((child) => {
        const born = formatDisplayDate(child.birthDate ?? undefined) ?? "—";
        return (
          <Pressable
            key={child.id}
            onPress={() => onPressChild?.(child.id, child.familyCode)}
            className="flex-row items-center px-3.5 py-2.5 border-b border-border active:bg-muted/40"
            accessibilityRole="button"
          >
            <AppText variant="bodyMedium" className="flex-[1.4] text-foreground pr-2" numberOfLines={1}>
              {child.name}
            </AppText>
            <AppText variant="labelSmall" className="flex-1 text-muted-foreground" numberOfLines={1}>
              {born}
            </AppText>
            <AppText variant="labelSmall" className="w-16 text-right text-muted-foreground">
              {statusLabel(child)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
