import { View } from "react-native";

import { DatePickerField } from "@/components/forms/DatePickerField";
import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { Switch } from "@/components/ui/switch";
import type { Gender } from "@/lib/data/types";
import type { FieldErrors } from "@/lib/forms/fieldErrors";

export type PersonFieldsValue = {
  firstName: string;
  lastName: string;
  maidenName: string;
  suffix: string;
  nickname: string;
  gender: Gender;
  isLiving: boolean;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
};

export const emptyPersonFieldsValue = (gender: Gender = "MALE"): PersonFieldsValue => ({
  firstName: "",
  lastName: "",
  maidenName: "",
  suffix: "",
  nickname: "",
  gender,
  isLiving: true,
  birthDate: "",
  birthPlace: "",
  deathDate: "",
  deathPlace: "",
});

type PersonFieldsProps = {
  value: PersonFieldsValue;
  onChange: (patch: Partial<PersonFieldsValue>) => void;
  fieldErrors?: FieldErrors;
  firstNameTestID?: string;
  lastNameTestID?: string;
  showDeathFields?: boolean;
};

export function PersonFields({
  value,
  onChange,
  fieldErrors = {},
  firstNameTestID,
  lastNameTestID,
  showDeathFields = true,
}: PersonFieldsProps) {
  return (
    <View className="gap-3 w-full">
      <FormTextInput
        testID={firstNameTestID}
        label="Given / first name"
        value={value.firstName}
        onChangeText={(t) => onChange({ firstName: t })}
        errorText={fieldErrors.firstName ?? fieldErrors.chFirst ?? fieldErrors.spFirst}
      />
      <FormTextInput
        testID={lastNameTestID}
        label="Family / last name"
        value={value.lastName}
        onChangeText={(t) => onChange({ lastName: t })}
        errorText={fieldErrors.lastName ?? fieldErrors.chLast ?? fieldErrors.spLast}
      />
      <FormTextInput
        label="Maiden name"
        value={value.maidenName}
        onChangeText={(t) => onChange({ maidenName: t })}
      />
      <FormTextInput
        label="Suffix"
        value={value.suffix}
        onChangeText={(t) => onChange({ suffix: t })}
      />
      <FormTextInput
        label="Nickname"
        value={value.nickname}
        onChangeText={(t) => onChange({ nickname: t })}
        placeholder="Optional — shown as a green chip"
      />
      <GenderField
        value={value.gender}
        onChange={(g) => onChange({ gender: g })}
        label="Gender"
      />
      <View className="flex-row items-center justify-between py-1">
        <AppText variant="labelLarge">Living</AppText>
        <Switch
          value={value.isLiving}
          onValueChange={(v) => onChange({ isLiving: v })}
        />
      </View>
      <DatePickerField
        label="Birth date"
        value={value.birthDate}
        onChange={(d) => onChange({ birthDate: d })}
      />
      <FormTextInput
        label="Birth location / city"
        value={value.birthPlace}
        onChangeText={(t) => onChange({ birthPlace: t })}
      />
      {showDeathFields && !value.isLiving ? (
        <>
          <DatePickerField
            label="Death date"
            value={value.deathDate}
            onChange={(d) => onChange({ deathDate: d })}
          />
          <FormTextInput
            label="Death location"
            value={value.deathPlace}
            onChangeText={(t) => onChange({ deathPlace: t })}
          />
        </>
      ) : null}
    </View>
  );
}
