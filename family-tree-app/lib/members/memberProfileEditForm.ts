import type { MemberRecord } from "@/lib/data/types";
import {
  emptyPersonFieldsValue,
  type PersonFieldsValue,
} from "@/lib/forms/personFieldsValue";

export type MemberProfileEditFields = PersonFieldsValue & {
  city: string;
  homeTown: string;
  occupation: string;
  bio: string;
};

export function editFieldsFromMember(member: MemberRecord): MemberProfileEditFields {
  const living = !member.deathDate;
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
    city: member.currentCity ?? "",
    homeTown: member.homeTown ?? "",
    occupation: member.occupation ?? "",
    bio: member.bio ?? "",
  };
}

export const emptyMemberProfileEditFields: MemberProfileEditFields = {
  ...emptyPersonFieldsValue(),
  city: "",
  homeTown: "",
  occupation: "",
  bio: "",
};
