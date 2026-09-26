import type { Gender } from "@/lib/data/types";

/** Person shape used for kinship + graph (matches Postgres `persons` row). */
export type KinshipPerson = {
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
  birthPlace: string | null;
  homeTown: string | null;
  occupation: string | null;
  bio: string | null;
};

export type KinshipRelative = KinshipPerson & {
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
  stepSiblings: KinshipRelative[];
  fullSiblings: KinshipRelative[];
};

export type KinshipUnionRecord = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  partner1: KinshipPerson;
  partner2: KinshipPerson;
  childships: {
    childId: string;
    child: KinshipPerson;
    relationshipType: string;
  }[];
};

export type ChildUnionContext = {
  unionId: string;
  relationshipType: string;
  union: {
    id: string;
    partner1Id: string;
    partner2Id: string;
    partner1: KinshipPerson;
    partner2: KinshipPerson;
    children: { childId: string; child: KinshipPerson }[];
  };
};
