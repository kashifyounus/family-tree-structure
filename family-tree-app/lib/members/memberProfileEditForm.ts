import type { MemberRecord } from "@/lib/data/types";

export type MemberProfileEditFields = {
  firstName: string;
  lastName: string;
  city: string;
  birthDate: string;
  birthPlace: string;
  homeTown: string;
  occupation: string;
  bio: string;
};

export function editFieldsFromMember(member: MemberRecord): MemberProfileEditFields {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    city: member.currentCity ?? "",
    birthDate: member.birthDate ?? "",
    birthPlace: member.birthPlace ?? "",
    homeTown: member.homeTown ?? "",
    occupation: member.occupation ?? "",
    bio: member.bio ?? "",
  };
}

export const emptyMemberProfileEditFields: MemberProfileEditFields = {
  firstName: "",
  lastName: "",
  city: "",
  birthDate: "",
  birthPlace: "",
  homeTown: "",
  occupation: "",
  bio: "",
};
