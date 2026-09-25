import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

export type ProfileSegment<T extends string> = {
  value: T;
  label: string;
};

type ProfileSegmentBarProps<T extends string> = {
  value: T;
  options: ProfileSegment<T>[];
  onChange: (value: T) => void;
  testIdPrefix?: string;
};

/** iOS-style segmented control in a rounded track (Figma person detail). */
export function ProfileSegmentBar<T extends string>({
  value,
  options,
  onChange,
  testIdPrefix,
}: ProfileSegmentBarProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-secondary/80 p-1 gap-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            testID={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
            onPress={() => onChange(opt.value)}
            className={`flex-1 rounded-lg py-2.5 items-center ${
              active ? "bg-card shadow-sm" : ""
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <AppText
              variant="labelMedium"
              className={active ? "text-foreground font-semibold" : "text-muted-foreground"}
            >
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
