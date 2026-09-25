/**
 * JSON shape returned by `GET /api/mobile/person/*`.
 * Keep in sync with `types/family.ts` → `PersonDetails` (server source of truth).
 *
 * Mobile app maps this into SQLite-shaped `PersonBundle` via `onlinePersonMapper`.
 * Fields present on the wire but not mapped to profile UI today: `photoUrl`,
 * `privacyLevel`, `motherTongue`, `permanentCity`, child `relationshipType`.
 */

export type ApiGender = "MALE" | "FEMALE" | "OTHER";

export type ApiRelationshipType = "BIOLOGICAL" | "ADOPTED" | "STEP";

export type ApiPrivacyLevel = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";

export type MobilePersonSummary = {
  id: string;
  familyCode: string;
  title: string | null;
  firstName: string;
  lastName: string;
  nickname: string | null;
  urduFirstName: string | null;
  urduLastName: string | null;
  gender: ApiGender;
  birthDate: string | null;
  deathDate: string | null;
  photoUrl: string | null;
  bio: string | null;
  isLiving: boolean;
  age: number | null;
  occupation: string | null;
  motherTongue: string | null;
  privacyLevel: ApiPrivacyLevel;
  birthPlace: string | null;
  currentCity: string | null;
  permanentCity: string | null;
  homeTown: string | null;
  treeDisplayIsPrivate?: boolean;
};

export type MobileChildWithRelation = MobilePersonSummary & {
  relationshipType: ApiRelationshipType;
  unionId: string;
};

export type MobileUnionSummary = {
  id: string;
  partner1: MobilePersonSummary;
  partner2: MobilePersonSummary;
  marriageDate: string | null;
  divorceDate: string | null;
  isActive: boolean;
  children: MobileChildWithRelation[];
};

export type MobileKinshipRelative = MobilePersonSummary & {
  kinshipLabel: string;
  side: "paternal" | "maternal" | "neutral";
  degree: "full" | "half" | "step" | "unknown";
};

export type MobileComputedRelations = {
  paternalUncles: MobileKinshipRelative[];
  paternalAunts: MobileKinshipRelative[];
  maternalUncles: MobileKinshipRelative[];
  maternalAunts: MobileKinshipRelative[];
  halfSiblings: MobileKinshipRelative[];
  fullSiblings: MobileKinshipRelative[];
};

export type MobileParentLink = {
  childshipId: string;
  unionId: string;
  relationshipType: ApiRelationshipType;
  partners: MobilePersonSummary[];
};

export type MobileHouseholdWifeGroup = {
  wifeId: string;
  wifeName: string;
  urduName: string | null;
  unionId: string;
  marriageDate: string | null;
  childrenCount: number;
  children: MobilePersonSummary[];
};

export type MobileHusbandFamilyReport = {
  husbandId: string;
  husbandName: string;
  wifeCount: number;
  totalChildren: number;
  byWife: MobileHouseholdWifeGroup[];
};

/** Wire payload for mobile person detail endpoints. */
export type MobilePersonDetails = {
  person: MobilePersonSummary;
  unions: MobileUnionSummary[];
  parentLinks: MobileParentLink[];
  computed: MobileComputedRelations;
  household: MobileHusbandFamilyReport | null;
};

const emptyComputed = (): MobileComputedRelations => ({
  fullSiblings: [],
  halfSiblings: [],
  paternalUncles: [],
  paternalAunts: [],
  maternalUncles: [],
  maternalAunts: [],
});

/** Coerce API JSON into a complete `MobilePersonDetails` (tolerates older/partial payloads). */
export function normalizeMobilePersonDetails(
  details: Partial<MobilePersonDetails> & Pick<MobilePersonDetails, "person">,
): MobilePersonDetails {
  return {
    person: details.person,
    unions: details.unions ?? [],
    parentLinks: details.parentLinks ?? [],
    computed: {
      ...emptyComputed(),
      ...details.computed,
      fullSiblings: details.computed?.fullSiblings ?? [],
      halfSiblings: details.computed?.halfSiblings ?? [],
      paternalUncles: details.computed?.paternalUncles ?? [],
      paternalAunts: details.computed?.paternalAunts ?? [],
      maternalUncles: details.computed?.maternalUncles ?? [],
      maternalAunts: details.computed?.maternalAunts ?? [],
    },
    household: details.household ?? null,
  };
}
