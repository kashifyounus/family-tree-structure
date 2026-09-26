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
  birthPlace: string | null;
  homeTown: string | null;
  currentCity: string | null;
  occupation: string | null;
  bio: string | null;
  fatherName?: string | null;
  motherName?: string | null;
};

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  gender: Gender;
  nickname?: string;
  urduFirstName?: string;
  urduLastName?: string;
  currentCity?: string;
  occupation?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  homeTown?: string;
};

export type UpdateMemberInput = Omit<Partial<CreateMemberInput>, "deathDate"> & {
  personId: string;
  /** Pass `null` to clear death date when marking someone living. */
  deathDate?: string | null;
};

export type AddSpouseInput = {
  relatedPersonId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  marriageDate?: string;
  nickname?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
};

export type ChildRelationshipType = "BIOLOGICAL" | "ADOPTED" | "STEP";

export type AddChildInput = {
  parentPersonId: string;
  unionId?: string;
  secondParentId?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate?: string;
  nickname?: string;
  birthPlace?: string;
  deathDate?: string;
  relationshipType?: ChildRelationshipType;
};

export type ReportBucket = { label: string; count: number };

export type LocalReports = {
  memberCount: number;
  livingCount: number;
  cities: ReportBucket[];
  ages: ReportBucket[];
};

export type UnionChildView = {
  id: string;
  name: string;
  familyCode: string;
  birthDate?: string | null;
  deathDate?: string | null;
};

export type LocalUnionView = {
  id: string;
  partner1Id?: string;
  partner2Id?: string;
  partner1Name: string;
  partner2Name: string;
  marriageDate?: string | null;
  divorceDate?: string | null;
  isActive?: boolean;
  children: UnionChildView[];
};

export type LinkSpouseInput = {
  personId: string;
  spouseId: string;
  marriageDate?: string;
};

export type LinkChildInput = {
  unionId: string;
  childId: string;
  relationshipType?: ChildRelationshipType;
};

export type SetParentsInput = {
  personId: string;
  parentAId: string;
  parentBId: string;
  relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP";
};

export type UpdateMarriageInput = {
  unionId: string;
  marriageDate?: string | null;
  divorceDate?: string | null;
  isActive?: boolean;
};
