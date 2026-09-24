import type {
  MobileComputedRelations,
  MobileKinshipRelative,
  MobileParentLink,
  MobilePersonDetails,
  MobilePersonSummary,
} from "@/lib/api/mobilePersonDetails";
import type { LocalUnionView, MemberRecord } from "@/lib/data/types";
import type { ComputedRelations, KinshipPerson, KinshipRelative } from "@/lib/kinship/types";

export type OnlineMappedPersonBundle = {
  member: MemberRecord;
  unions: LocalUnionView[];
  parents: KinshipPerson[];
  computed: ComputedRelations | null;
  onlineDetails: MobilePersonDetails;
};

function mapSummaryToMember(m: MobilePersonSummary): MemberRecord {
  return {
    id: m.id,
    familyCode: m.familyCode,
    firstName: m.firstName,
    lastName: m.lastName,
    nickname: m.nickname,
    urduFirstName: m.urduFirstName,
    urduLastName: m.urduLastName,
    gender: m.gender,
    birthDate: m.birthDate,
    deathDate: m.deathDate,
    birthPlace: m.birthPlace,
    homeTown: m.homeTown,
    currentCity: m.currentCity,
    occupation: m.occupation,
    bio: m.bio,
  };
}

export function mapOnlineDetailsToBundle(data: MobilePersonDetails): OnlineMappedPersonBundle {
  return {
    member: mapSummaryToMember(data.person),
    unions: data.unions.map((u) => ({
      id: u.id,
      partner1Id: u.partner1.id,
      partner2Id: u.partner2.id,
      partner1Name: `${u.partner1.firstName} ${u.partner1.lastName}`,
      partner2Name: `${u.partner2.firstName} ${u.partner2.lastName}`,
      marriageDate: u.marriageDate,
      divorceDate: u.divorceDate,
      isActive: u.isActive,
      children: u.children.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        familyCode: c.familyCode,
      })),
    })),
    parents: parentsFromParentLinks(data.parentLinks),
    computed: computedRelationsFromMobile(data.computed),
    onlineDetails: data,
  };
}

export function mapSummaryToKinshipPerson(p: MobilePersonSummary): KinshipPerson {
  return {
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
    nickname: p.nickname,
    urduFirstName: p.urduFirstName,
    urduLastName: p.urduLastName,
    gender: p.gender,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    currentCity: p.currentCity,
    birthPlace: p.birthPlace,
    homeTown: p.homeTown,
    occupation: p.occupation,
    bio: p.bio,
  };
}

/** Unique parent persons from API parent links (both partners per birth union). */
export function parentsFromParentLinks(links: MobileParentLink[]): KinshipPerson[] {
  const byId = new Map<string, KinshipPerson>();
  for (const link of links) {
    for (const partner of link.partners) {
      if (!byId.has(partner.id)) {
        byId.set(partner.id, mapSummaryToKinshipPerson(partner));
      }
    }
  }
  return [...byId.values()];
}

/** @deprecated use `parentsFromParentLinks` */
export const parentsFromOnlineParentLinks = parentsFromParentLinks;

function mapKinshipRelative(r: MobileKinshipRelative): KinshipRelative {
  return {
    ...mapSummaryToKinshipPerson(r),
    kinshipLabel: r.kinshipLabel,
    side: r.side,
    degree: r.degree,
  };
}

function mapComputedList(
  items: MobileKinshipRelative[],
): KinshipRelative[] {
  return items.map(mapKinshipRelative);
}

export function computedRelationsFromMobile(
  computed: MobileComputedRelations,
): ComputedRelations {
  return {
    fullSiblings: mapComputedList(computed.fullSiblings),
    halfSiblings: mapComputedList(computed.halfSiblings),
    paternalUncles: mapComputedList(computed.paternalUncles),
    paternalAunts: mapComputedList(computed.paternalAunts),
    maternalUncles: mapComputedList(computed.maternalUncles),
    maternalAunts: mapComputedList(computed.maternalAunts),
  };
}

/** @deprecated use `computedRelationsFromMobile` */
export function computedRelationsFromOnline(
  computed: MobileComputedRelations | undefined,
): ComputedRelations | null {
  if (!computed) return null;
  return computedRelationsFromMobile(computed);
}

/** @deprecated use `mapSummaryToKinshipPerson` */
export const mapOnlineSummaryToKinshipPerson = mapSummaryToKinshipPerson;
