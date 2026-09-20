import type { Gender, PrivacyLevel, RelationshipType } from "@prisma/client";

export type PersonSummary = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string | null;
  deathDate: string | null;
  photoUrl: string | null;
  bio: string | null;
  isLiving: boolean;
  privacyLevel: PrivacyLevel;
};

export type UnionSummary = {
  id: string;
  partner1: PersonSummary;
  partner2: PersonSummary;
  marriageDate: string | null;
  divorceDate: string | null;
  isActive: boolean;
  sequenceOrder: number;
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

export type PersonDetails = {
  person: PersonSummary;
  unions: UnionSummary[];
  computed: ComputedRelations;
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
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate?: string;
  deathDate?: string;
  bio?: string;
  isLiving?: boolean;
  relationshipType?: RelationshipType;
  mode: "spouse" | "child";
  relatedPersonId: string;
  existingUnionId?: string;
  secondParentId?: string;
  marriageDate?: string;
};
