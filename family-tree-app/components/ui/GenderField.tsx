import { Text, SegmentedButtons, useTheme } from "react-native-paper";

import { copy } from "@/content/businessCopy";
import type { Gender } from "@/lib/data/types";
import { space } from "@/theme/tokens";

type GenderFieldProps = {
  value: Gender;
  onChange: (value: Gender) => void;
  label?: string;
};

export function GenderField({ value, onChange, label }: GenderFieldProps) {
  const theme = useTheme();

  return (
    <>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: space.xs }}>
        {label ?? copy.members.genderLabel}
      </Text>
      <SegmentedButtons
        value={value}
        onValueChange={(v) => onChange(v as Gender)}
        buttons={[
          { value: "MALE", label: copy.gender.MALE },
          { value: "FEMALE", label: copy.gender.FEMALE },
          { value: "OTHER", label: copy.gender.OTHER },
        ]}
      />
    </>
  );
}
