import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

type OutlineChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
};

export function OutlineChip({ label, selected, onPress, testID }: OutlineChipProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="rounded-full border px-4 min-h-9 justify-center"
      style={{
        borderColor: selected ? kuriosityDesign.brand.primary : "#DDD3C4",
        backgroundColor: selected ? kuriosityDesign.colors.selectedRowFill : "#FFFDF8",
      }}
    >
      <AppText
        variant="labelMedium"
        className={selected ? "text-primary font-semibold" : "text-foreground"}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
