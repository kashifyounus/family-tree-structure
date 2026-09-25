import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import type { Gender } from "@/lib/data/types";

const OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

type GenderFieldProps = {
  value: Gender;
  onChange: (gender: Gender) => void;
  label?: string;
};

export function GenderField({ value, onChange, label }: GenderFieldProps) {
  return (
    <View className="gap-2 w-full">
      {label ? <AppText variant="labelLarge">{label}</AppText> : null}
      <RadioGroup
        value={value}
        onChange={(next) => onChange(next as Gender)}
        className="w-full gap-0 rounded-xl border border-border overflow-hidden bg-muted/20"
      >
        {OPTIONS.map((opt, index) => (
          <Radio
            key={opt.value}
            value={opt.value}
            size="md"
            className={`w-full flex-row items-center justify-between px-4 py-3.5 ${
              index < OPTIONS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <RadioLabel className="text-base">{opt.label}</RadioLabel>
            <RadioIndicator>
              <RadioIcon />
            </RadioIndicator>
          </Radio>
        ))}
      </RadioGroup>
    </View>
  );
}
