import { View } from "react-native";

import { DatePickerField } from "@/components/forms/DatePickerField";
import { ProvinceCityPicker } from "@/components/forms/ProvinceCityPicker";
import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import type { Gender } from "@/lib/data/types";
import type { FieldErrors } from "@/lib/forms/fieldErrors";
import {
  formatPakistanPlace,
  parsePakistanPlace,
  type PakistanProvince,
} from "../../../shared/geo/pakistanPlaces";

export type AddMemberFormValue = {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  birthProvince: PakistanProvince | null;
  birthCity: string;
  livingProvince: PakistanProvince | null;
  livingCity: string;
};

export const emptyAddMemberFormValue = (): AddMemberFormValue => ({
  firstName: "",
  lastName: "",
  gender: "MALE",
  birthDate: "",
  birthProvince: null,
  birthCity: "",
  livingProvince: null,
  livingCity: "",
});

type AddMemberFormFieldsProps = {
  value: AddMemberFormValue;
  onChange: (patch: Partial<AddMemberFormValue>) => void;
  fieldErrors?: FieldErrors;
};

export function AddMemberFormFields({
  value,
  onChange,
  fieldErrors = {},
}: AddMemberFormFieldsProps) {
  return (
    <View className="gap-4 w-full">
      <FormTextInput
        testID="add-member-first"
        label="First name"
        value={value.firstName}
        onChangeText={(t) => onChange({ firstName: t })}
        errorText={fieldErrors.firstName}
      />
      <FormTextInput
        testID="add-member-last"
        label="Last name (optional)"
        value={value.lastName}
        onChangeText={(t) => onChange({ lastName: t })}
        errorText={fieldErrors.lastName}
      />
      <GenderField
        value={value.gender}
        onChange={(g) => onChange({ gender: g })}
        label="Gender *"
      />
      {fieldErrors.gender ? (
        <AppText variant="labelSmall" className="text-destructive">
          {fieldErrors.gender}
        </AppText>
      ) : null}
      <DatePickerField
        label="Birth date (optional)"
        value={value.birthDate}
        onChange={(d) => onChange({ birthDate: d })}
        testID="add-member-birth-date"
      />
      <ProvinceCityPicker
        label="Birth place (optional)"
        province={value.birthProvince}
        city={value.birthCity}
        onProvinceChange={(p) => onChange({ birthProvince: p, birthCity: "" })}
        onCityChange={(c) => onChange({ birthCity: c })}
        testIdPrefix="add-member-birth"
      />
      <ProvinceCityPicker
        label="Living city (optional)"
        province={value.livingProvince}
        city={value.livingCity}
        onProvinceChange={(p) => onChange({ livingProvince: p, livingCity: "" })}
        onCityChange={(c) => onChange({ livingCity: c })}
        testIdPrefix="add-member-living"
      />
    </View>
  );
}

export function birthPlaceFromForm(value: AddMemberFormValue): string | undefined {
  if (!value.birthCity.trim() || !value.birthProvince) return undefined;
  return formatPakistanPlace(value.birthCity, value.birthProvince);
}

export function livingCityFromForm(value: AddMemberFormValue): string | undefined {
  if (!value.livingCity.trim() || !value.livingProvince) return undefined;
  return formatPakistanPlace(value.livingCity, value.livingProvince);
}

export function hydrateAddMemberPlaces(
  birthPlace?: string | null,
  currentCity?: string | null,
): Pick<AddMemberFormValue, "birthProvince" | "birthCity" | "livingProvince" | "livingCity"> {
  const birth = parsePakistanPlace(birthPlace);
  const living = parsePakistanPlace(currentCity);
  return {
    birthProvince: birth.province,
    birthCity: birth.city,
    livingProvince: living.province,
    livingCity: living.city,
  };
}
