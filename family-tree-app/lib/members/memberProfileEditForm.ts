import type { MemberRecord } from "@/lib/data/types";
import {
  birthPlaceFromPakistanFields,
  emptyPakistanPlaceFields,
  homeTownFromPakistanFields,
  hydratePakistanPlaceFields,
  livingCityFromPakistanFields,
  type PakistanPlaceFields,
} from "@/lib/forms/pakistanPlaceForm";
import {
  emptyPersonFieldsValue,
  type PersonFieldsValue,
} from "@/lib/forms/personFieldsValue";
import { parsePakistanPlace, type PakistanProvince } from "../../../shared/geo/pakistanPlaces";

export type MemberProfileEditFields = PersonFieldsValue &
  PakistanPlaceFields & {
    homeTownProvince: PakistanProvince | null;
    homeTownCity: string;
    occupation: string;
    biradari: string;
    bio: string;
  };

export function editFieldsFromMember(member: MemberRecord): MemberProfileEditFields {
  const living = !member.deathDate;
  const places = hydratePakistanPlaceFields(member.birthPlace, member.currentCity);
  const home = parsePakistanPlace(member.homeTown);
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    maidenName: "",
    suffix: "",
    nickname: member.nickname ?? "",
    gender: member.gender,
    isLiving: living,
    birthDate: member.birthDate ?? "",
    birthPlace: member.birthPlace ?? "",
    deathDate: member.deathDate ?? "",
    deathPlace: "",
    ...places,
    homeTownProvince: home.province,
    homeTownCity: home.city,
    occupation: member.occupation ?? "",
    biradari: member.biradari ?? "",
    bio: member.bio ?? "",
  };
}

export function placesFromEditFields(editFields: MemberProfileEditFields) {
  return {
    birthPlace: birthPlaceFromPakistanFields(editFields),
    currentCity: livingCityFromPakistanFields(editFields),
    homeTown: homeTownFromPakistanFields(
      editFields.homeTownProvince,
      editFields.homeTownCity,
    ),
  };
}

export const emptyMemberProfileEditFields: MemberProfileEditFields = {
  ...emptyPersonFieldsValue(),
  ...emptyPakistanPlaceFields(),
  homeTownProvince: null,
  homeTownCity: "",
  occupation: "",
  biradari: "",
  bio: "",
};
