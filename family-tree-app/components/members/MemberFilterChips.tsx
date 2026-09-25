import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

export type MemberFilterChip = "all" | "living" | "generations";

const CHIP_LABELS: Record<MemberFilterChip, string> = {
  all: "All",
  living: "Living",
  generations: "Generations",
};

type MemberFilterChipsProps = {
  value: MemberFilterChip;
  onChange: (value: MemberFilterChip) => void;
};

export function MemberFilterChips({ value, onChange }: MemberFilterChipsProps) {
  return (
    <View className="flex-row gap-2 flex-wrap">
      {(Object.keys(CHIP_LABELS) as MemberFilterChip[]).map((chip) => {
        const active = value === chip;
        return (
          <Pressable
            key={chip}
            onPress={() => onChange(chip)}
            className={`rounded-full px-4 py-2 border ${
              active ? "bg-primary border-primary" : "bg-card border-border"
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            testID={`members-chip-${chip}`}
          >
            <AppText
              variant="labelMedium"
              className={active ? "text-primary-foreground font-medium" : "text-foreground"}
            >
              {CHIP_LABELS[chip]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
