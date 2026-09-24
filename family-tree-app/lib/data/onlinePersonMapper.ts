import type { Gender } from "@/lib/data/types";
import type {
  OnlineComputedRelations,
  OnlineParentLink,
  OnlinePersonSummary,
} from "@/lib/api";
import type { ComputedRelations, KinshipPerson, KinshipRelative } from "@/lib/kinship/types";

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
