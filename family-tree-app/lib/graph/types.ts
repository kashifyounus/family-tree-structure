import type { KinshipPerson } from "@/lib/kinship/types";

export type GraphPersonSummary = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  urduFirstName?: string | null;
  urduLastName?: string | null;
  gender: KinshipPerson["gender"];
  birthDate: string | null;
  deathDate: string | null;
  currentCity: string | null;
  isLiving: boolean;
};

export type FamilyGraphNode = {
  id: string;
  type: "person";
  position: { x: number; y: number };
  data: {
    person: GraphPersonSummary;
    isFocal?: boolean;
    isDeceased?: boolean;
    hasUnexpandedParents?: boolean;
    hasUnexpandedChildren?: boolean;
    hasUnexpandedSiblings?: boolean;
  };
};

export type FamilyGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "spouse" | "parent" | "child";
};

export type FamilyGraph = {
  focalPersonId: string;
  nodes: FamilyGraphNode[];
  edges: FamilyGraphEdge[];
};
