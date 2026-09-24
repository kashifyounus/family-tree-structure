import type {
  OnlineComputedRelations,
  OnlineParentLink,
  OnlinePersonDetails,
  OnlinePersonSummary,
} from "@/lib/api";
import type { LocalUnionView, MemberRecord } from "@/lib/data/types";
import type { ComputedRelations, KinshipPerson, KinshipRelative } from "@/lib/kinship/types";

export type OnlineMappedPersonBundle = {
  member: MemberRecord;
  unions: LocalUnionView[];
  parents: KinshipPerson[];
  computed: ComputedRelations | null;
  onlineDetails: OnlinePersonDetails;
};

function mapOnlinePersonToMember(m: OnlinePersonSummary): MemberRecord {
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
    birthPlace: m.birthPlace ?? null,
    homeTown: m.homeTown ?? null,
    currentCity: m.currentCity,
    occupation: m.occupation,
    bio: m.bio,
  };
}

export function mapOnlineDetailsToBundle(data: OnlinePersonDetails): OnlineMappedPersonBundle {
  return {
    member: mapOnlinePersonToMember(data.person),
    unions: data.unions.map((u) => ({
      id: u.id,
      partner1Id: u.partner1.id,
      partner2Id: u.partner2.id,
      partner1Name: `${u.partner1.firstName} ${u.partner1.lastName}`,
      partner2Name: `${u.partner2.firstName} ${u.partner2.lastName}`,
      marriageDate: u.marriageDate ?? null,
      divorceDate: u.divorceDate ?? null,
      isActive: u.isActive ?? true,
      children: u.children.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        familyCode: c.familyCode,
      })),
    })),
    parents: parentsFromOnlineParentLinks(data.parentLinks ?? []),
    computed: computedRelationsFromOnline(data.computed),
    onlineDetails: data,
  };
}

export function mapOnlineSummaryToKinshipPerson(p: OnlinePersonSummary): KinshipPerson {
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
    birthPlace: p.birthPlace ?? null,
    homeTown: p.homeTown ?? null,
    occupation: p.occupation,
    bio: p.bio,
  };
}

/** Unique parent persons from API parent links (both partners per birth union). */
export function parentsFromOnlineParentLinks(links: OnlineParentLink[]): KinshipPerson[] {
  const byId = new Map<string, KinshipPerson>();
  for (const link of links) {
    for (const partner of link.partners) {
      if (!byId.has(partner.id)) {
        byId.set(partner.id, mapOnlineSummaryToKinshipPerson(partner));
      }
    }
  }
  return [...byId.values()];
}

function mapKinshipRelative(
  items: OnlineComputedRelations["fullSiblings"],
  label: string,
  side: KinshipRelative["side"],
): KinshipRelative[] {
  return items.map((p) => ({
    ...mapOnlineSummaryToKinshipPerson(p),
    kinshipLabel: p.kinshipLabel ?? label,
    side: p.side ?? side,
    degree: p.degree ?? "unknown",
  }));
}

export function computedRelationsFromOnline(
  computed: OnlineComputedRelations | undefined,
): ComputedRelations | null {
  if (!computed) return null;
  return {
    fullSiblings: mapKinshipRelative(computed.fullSiblings ?? [], "Full sibling", "neutral"),
    halfSiblings: mapKinshipRelative(computed.halfSiblings ?? [], "Half sibling", "neutral"),
    paternalUncles: mapKinshipRelative(computed.paternalUncles ?? [], "Paternal uncle", "paternal"),
    paternalAunts: mapKinshipRelative(computed.paternalAunts ?? [], "Paternal aunt", "paternal"),
    maternalUncles: mapKinshipRelative(computed.maternalUncles ?? [], "Maternal uncle", "maternal"),
    maternalAunts: mapKinshipRelative(computed.maternalAunts ?? [], "Maternal aunt", "maternal"),
  };
}
