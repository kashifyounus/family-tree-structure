import { View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  testIdPrefix?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          testID={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
          size="sm"
          variant={value === opt.value ? "default" : "outline"}
          onPress={() => onChange(opt.value)}
          className="flex-1 min-w-[40%]"
        >
          <ButtonText>{opt.label}</ButtonText>
        </Button>
      ))}
    </View>
  );
}
