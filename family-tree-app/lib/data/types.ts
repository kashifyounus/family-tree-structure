export type StorageMode = "local" | "online";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type MemberRecord = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  urduFirstName: string | null;
  urduLastName: string | null;
  gender: Gender;
  birthDate: string | null;
  deathDate: string | null;
  currentCity: string | null;
  occupation: string | null;
  bio: string | null;
};

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  gender: Gender;
  urduFirstName?: string;
  urduLastName?: string;
  currentCity?: string;
};

export type LocalUnionView = {
  id: string;
  partner1Name: string;
  partner2Name: string;
  children: { id: string; name: string; familyCode: string }[];
};
