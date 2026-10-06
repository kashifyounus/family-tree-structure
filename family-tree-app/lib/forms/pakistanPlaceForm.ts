import {
  formatPakistanPlace,
  parsePakistanPlace,
  type PakistanProvince,
} from "../../../shared/geo/pakistanPlaces";

export type PakistanPlaceFields = {
  birthProvince: PakistanProvince | null;
  birthCity: string;
  livingProvince: PakistanProvince | null;
  livingCity: string;
};

export const emptyPakistanPlaceFields = (): PakistanPlaceFields => ({
  birthProvince: null,
  birthCity: "",
  livingProvince: null,
  livingCity: "",
});

export function hydratePakistanPlaceFields(
  birthPlace?: string | null,
  currentCity?: string | null,
): PakistanPlaceFields {
  const birth = parsePakistanPlace(birthPlace);
  const living = parsePakistanPlace(currentCity);
  return {
    birthProvince: birth.province,
    birthCity: birth.city,
    livingProvince: living.province,
    livingCity: living.city,
  };
}

export function birthPlaceFromPakistanFields(
  fields: PakistanPlaceFields,
): string | undefined {
  if (!fields.birthCity.trim() || !fields.birthProvince) return undefined;
  return formatPakistanPlace(fields.birthCity, fields.birthProvince);
}

export function livingCityFromPakistanFields(
  fields: PakistanPlaceFields,
): string | undefined {
  if (!fields.livingCity.trim() || !fields.livingProvince) return undefined;
  return formatPakistanPlace(fields.livingCity, fields.livingProvince);
}

export function homeTownFromPakistanFields(
  province: PakistanProvince | null,
  city: string,
): string | undefined {
  if (!city.trim() || !province) return city.trim() || undefined;
  return formatPakistanPlace(city, province);
}
