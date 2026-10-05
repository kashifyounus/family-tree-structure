import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { OutlineChip } from "@/components/ui/OutlineChip";
import {
  PAKISTAN_PROVINCES,
  type PakistanProvince,
  searchPakistanCities,
} from "../../../shared/geo/pakistanPlaces";

type ProvinceCityPickerProps = {
  label: string;
  province: PakistanProvince | null;
  city: string;
  onProvinceChange: (province: PakistanProvince) => void;
  onCityChange: (city: string) => void;
  errorText?: string;
  testIdPrefix?: string;
};

export function ProvinceCityPicker({
  label,
  province,
  city,
  onProvinceChange,
  onCityChange,
  errorText,
  testIdPrefix = "place",
}: ProvinceCityPickerProps) {
  const [cityQuery, setCityQuery] = useState("");

  const cities = useMemo(() => {
    if (!province) return [];
    return searchPakistanCities(province, cityQuery);
  }, [province, cityQuery]);

  return (
    <View className="gap-2 w-full">
      <AppText variant="labelLarge">{label}</AppText>
      <AppText variant="labelSmall" className="text-muted-foreground">
        Province
      </AppText>
      <View className="flex-row flex-wrap gap-2">
        {PAKISTAN_PROVINCES.map((p) => (
          <OutlineChip
            key={p}
            testID={`${testIdPrefix}-province-${p.replace(/\s+/g, "-").toLowerCase()}`}
            label={p}
            selected={province === p}
            onPress={() => {
              onProvinceChange(p);
              onCityChange("");
              setCityQuery("");
            }}
          />
        ))}
      </View>
      {province ? (
        <>
          <FormTextInput
            testID={`${testIdPrefix}-city-search`}
            label="City"
            value={cityQuery || city}
            onChangeText={(t) => {
              setCityQuery(t);
              if (!t.trim()) onCityChange("");
            }}
            placeholder={`Search cities in ${province}`}
          />
          <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {cities.map((c) => (
              <OutlineChip
                key={c}
                testID={`${testIdPrefix}-city-${c.replace(/\s+/g, "-").toLowerCase()}`}
                label={c}
                selected={city === c}
                onPress={() => {
                  onCityChange(c);
                  setCityQuery(c);
                }}
              />
            ))}
          </ScrollView>
        </>
      ) : (
        <AppText variant="bodySmall" className="text-muted-foreground">
          Select a province to choose a city.
        </AppText>
      )}
      {errorText ? (
        <AppText variant="labelSmall" className="text-destructive">{errorText}</AppText>
      ) : null}
    </View>
  );
}
