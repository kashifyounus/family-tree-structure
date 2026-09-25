export type DemoGender = "MALE" | "FEMALE" | "OTHER";

export type DemoChildRelationship = "BIOLOGICAL" | "ADOPTED" | "STEP";

export type DemoPersonDraft = {
  id: string;
  firstName: string;
  lastName: string;
  gender: DemoGender;
  birthDate: string;
  deathDate: string | null;
  currentCity: string;
};

export type DemoUnionDraft = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  marriageDate: string;
  divorceDate: string | null;
  isActive: boolean;
};

export type DemoChildDraft = {
  id: string;
  unionId: string;
  childId: string;
  relationshipType: DemoChildRelationship;
};

export type DemoDatasetStats = {
  persons: number;
  unions: number;
  childLinks: number;
  biological: number;
  adopted: number;
  step: number;
  activeUnions: number;
  remarriages: number;
  uniqueFullNames: number;
  uniqueCities: number;
};

export type DemoDataset = {
  version: 1;
  seed: number;
  targetPersons: number;
  focalPersonId: string;
  persons: DemoPersonDraft[];
  unions: DemoUnionDraft[];
  children: DemoChildDraft[];
  stats: DemoDatasetStats;
};

export type BuildHugeDemoDatasetOptions = {
  targetPersons?: number;
  seed?: number;
};
