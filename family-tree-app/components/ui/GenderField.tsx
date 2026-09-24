import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
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
    <View className="gap-2">
      {label ? <AppText variant="labelLarge">{label}</AppText> : null}
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={value === opt.value ? "default" : "outline"}
            onPress={() => onChange(opt.value)}
          >
            <ButtonText>{opt.label}</ButtonText>
          </Button>
        ))}
      </View>
    </View>
  );
}
