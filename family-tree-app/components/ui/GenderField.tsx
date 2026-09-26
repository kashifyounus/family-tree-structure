import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { OutlineChip } from "@/components/ui/OutlineChip";
import type { Gender } from "@/lib/data/types";

const OPTIONS: { value: Gender; label: string; testID: string }[] = [
  { value: "MALE", label: "Male", testID: "gender-male" },
  { value: "FEMALE", label: "Female", testID: "gender-female" },
  { value: "OTHER", label: "Other", testID: "gender-other" },
];

type GenderFieldProps = {
  value: Gender;
  onChange: (gender: Gender) => void;
  label?: string;
};

/** Chip-based gender control (reliable inside Actionsheet / scroll forms). */
export function GenderField({ value, onChange, label }: GenderFieldProps) {
  return (
    <View className="gap-2 w-full">
      {label ? <AppText variant="labelLarge">{label}</AppText> : null}
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <OutlineChip
            key={opt.value}
            testID={opt.testID}
            label={opt.label}
            selected={value === opt.value}
            onPress={() => onChange(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}
