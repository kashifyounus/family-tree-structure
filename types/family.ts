import type { Gender, PrivacyLevel, RelationshipType } from "@prisma/client";

export type PersonSummary = {
  id: string;
  familyCode: string;
  title: string | null;
  firstName: string;
  lastName: string;
  nickname: string | null;
  urduFirstName: string | null;
  urduLastName: string | null;
  gender: Gender;
  birthDate: string | null;
  deathDate: string | null;
  photoUrl: string | null;
  bio: string | null;
  isLiving: boolean;
  age: number | null;
  occupation: string | null;
  motherTongue: string | null;
  privacyLevel: PrivacyLevel;
  birthPlace: string | null;
  currentCity: string | null;
  permanentCity: string | null;
  homeTown: string | null;
};

export type UnionSummary = {
  id: string;
  partner1: PersonSummary;
  partner2: PersonSummary;
  marriageDate: string | null;
  divorceDate: string | null;
  isActive: boolean;
  children: ChildWithRelation[];
};

export type ChildWithRelation = PersonSummary & {
  relationshipType: RelationshipType;
  unionId: string;
};

export type KinshipRelative = PersonSummary & {
  kinshipLabel: string;
  side: "paternal" | "maternal" | "neutral";
  degree: "full" | "half" | "step" | "unknown";
};

export type ComputedRelations = {
  paternalUncles: KinshipRelative[];
  paternalAunts: KinshipRelative[];
  maternalUncles: KinshipRelative[];
  maternalAunts: KinshipRelative[];
  halfSiblings: KinshipRelative[];
  fullSiblings: KinshipRelative[];
};

export type HouseholdWifeGroup = {
  wifeId: string;
  wifeName: string;
  urduName: string | null;
  unionId: string;
  marriageDate: string | null;
  childrenCount: number;
  children: PersonSummary[];
};

export type HusbandFamilyReport = {
  husbandId: string;
  husbandName: string;
  wifeCount: number;
  totalChildren: number;
  byWife: HouseholdWifeGroup[];
};

export type PersonDetails = {
  person: PersonSummary;
  unions: UnionSummary[];
  computed: ComputedRelations;
  household: HusbandFamilyReport | null;
};

export type GraphNodeType = "person" | "union";

export type FamilyGraphNode = {
  id: string;
  type: GraphNodeType;
  position: { x: number; y: number };
  data: {
    person?: PersonSummary;
    unionId?: string;
    label?: string;
    isFocal?: boolean;
    isDeceased?: boolean;
    hasUnexpandedParents?: boolean;
    hasUnexpandedChildren?: boolean;
  };
};

export type FamilyGraphEdge = {
  id: string;
  source: string;
  target: string;
  type?: "spouse" | "parent" | "child";
  label?: string;
  animated?: boolean;
};

export type FamilyGraph = {
  focalPersonId: string;
  nodes: FamilyGraphNode[];
  edges: FamilyGraphEdge[];
};

export type SearchResult = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  urduFirstName: string | null;
  urduLastName: string | null;
  birthYear: number | null;
};

export type RelationshipPathStep = {
  fromId: string;
  toId: string;
  relation: string;
};

export type RelationshipPath = {
  from: PersonSummary;
  to: PersonSummary;
  steps: RelationshipPathStep[];
  summary: string;
};

export type CreatePersonAndUnionInput = {
  title?: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  urduFirstName?: string;
  urduLastName?: string;
  gender: Gender;
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  bio?: string;
  occupation?: string;
  motherTongue?: string;
  birthPlace?: string;
  currentCity?: string;
  permanentCity?: string;
  homeTown?: string;
  relationshipType?: RelationshipType;
  mode: "spouse" | "child";
  relatedPersonId: string;
  existingUnionId?: string;
  secondParentId?: string;
  marriageDate?: string;
};

export type UpdatePersonInput = {
  personId: string;
  title?: string | null;
  firstName?: string;
  lastName?: string;
  nickname?: string | null;
  urduFirstName?: string | null;
  urduLastName?: string | null;
  gender?: Gender;
  birthDate?: string | null;
  deathDate?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  occupation?: string | null;
  motherTongue?: string | null;
  privacyLevel?: PrivacyLevel;
  birthPlace?: string | null;
  currentCity?: string | null;
  permanentCity?: string | null;
  homeTown?: string | null;
};

export type UpdateUnionInput = {
  unionId: string;
  marriageDate?: string | null;
  divorceDate?: string | null;
  isActive?: boolean;
};

export type CityDistributionBucket = {
  label: string;
  count: number;
};

export type CityDistributionReport = {
  currentCity: CityDistributionBucket[];
  homeTown: CityDistributionBucket[];
  birthPlace: CityDistributionBucket[];
};

export type AgeDemographicBucket = {
  range: string;
  count: number;
};
