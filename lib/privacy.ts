import type { PrivacyLevel } from "@prisma/client";
import type { AuthContext, UserRole } from "@/lib/auth";
import type {
  KinshipRelative,
  PersonDetails,
  PersonSummary,
  UnionSummary,
} from "@/types/family";

const MASKED = "—";

/** Shown on tree and lists when the viewer cannot see this living person’s identity. */
export const TREE_PRIVATE_PLACEHOLDER = "Private";

function birthYearOnly(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return String(new Date(isoDate).getFullYear());
}

function shouldMaskLivingPerson(
  person: PersonSummary,
  viewer: AuthContext,
): boolean {
  if (!person.isLiving) return false;

  if (person.privacyLevel === "PUBLIC") return false;

  if (viewer.role === "CONTRIBUTOR" || viewer.role === "ADMIN") {
    return false;
  }

  return viewer.role === "GUEST" || viewer.role === "VIEWER";
}

export function maskPersonSummary(
  person: PersonSummary,
  viewer: AuthContext,
): PersonSummary {
  if (!shouldMaskLivingPerson(person, viewer)) {
    return { ...person, treeDisplayIsPrivate: false };
  }

  return {
    ...person,
    birthDate: person.birthDate ? `${birthYearOnly(person.birthDate)}-01-01` : null,
    deathDate: null,
    bio: null,
    photoUrl: null,
    birthPlace: null,
    currentCity: null,
    permanentCity: null,
    homeTown: null,
    age: birthYearOnly(person.birthDate)
      ? new Date().getFullYear() - parseInt(birthYearOnly(person.birthDate)!, 10)
      : null,
    firstName: TREE_PRIVATE_PLACEHOLDER,
    lastName: "",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    familyCode: TREE_PRIVATE_PLACEHOLDER,
    treeDisplayIsPrivate: true,
  };
}

function maskKinshipRelative(
  relative: KinshipRelative,
  viewer: AuthContext,
): KinshipRelative {
  return {
    ...maskPersonSummary(relative, viewer),
    kinshipLabel: relative.kinshipLabel,
    side: relative.side,
    degree: relative.degree,
  };
}

export function maskUnionSummary(
  union: UnionSummary,
  viewer: AuthContext,
): UnionSummary {
  return {
    ...union,
    partner1: maskPersonSummary(union.partner1, viewer),
    partner2: maskPersonSummary(union.partner2, viewer),
    children: union.children.map((c) => ({
      ...maskPersonSummary(c, viewer),
      relationshipType: c.relationshipType,
      unionId: c.unionId,
    })),
    marriageDate:
      viewer.role === "GUEST" || viewer.role === "VIEWER"
        ? birthYearOnly(union.marriageDate)
          ? `${birthYearOnly(union.marriageDate)}-01-01`
          : null
        : union.marriageDate,
    divorceDate:
      viewer.role === "GUEST" || viewer.role === "VIEWER"
        ? null
        : union.divorceDate,
  };
}

export function maskPersonDetails(
  details: PersonDetails,
  viewer: AuthContext,
): PersonDetails {
  return {
    person: maskPersonSummary(details.person, viewer),
    unions: details.unions.map((u) => maskUnionSummary(u, viewer)),
    parentLinks: details.parentLinks.map((link) => ({
      ...link,
      partners: link.partners.map((partner) => maskPersonSummary(partner, viewer)),
    })),
    computed: {
      paternalUncles: details.computed.paternalUncles.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
      paternalAunts: details.computed.paternalAunts.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
      maternalUncles: details.computed.maternalUncles.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
      maternalAunts: details.computed.maternalAunts.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
      fullSiblings: details.computed.fullSiblings.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
      halfSiblings: details.computed.halfSiblings.map((r) =>
        maskKinshipRelative(r, viewer),
      ),
    },
    household: details.household
      ? {
          ...details.household,
          byWife: details.household.byWife.map((g) => ({
            ...g,
            children: g.children.map((c) => maskPersonSummary(c, viewer)),
          })),
        }
      : null,
  };
}

export function formatBirthDisplay(
  person: PersonSummary,
  viewer: AuthContext,
): string {
  if (!person.birthDate) return MASKED;
  if (shouldMaskLivingPerson(person, viewer)) {
    const year = birthYearOnly(person.birthDate);
    return year ? `b. ${year}` : MASKED;
  }
  return new Date(person.birthDate).toLocaleDateString();
}

export function canViewExactDates(
  privacyLevel: PrivacyLevel,
  role: UserRole,
): boolean {
  if (role === "ADMIN") return true;
  if (privacyLevel === "PUBLIC") return true;
  if (role === "GUEST" || role === "VIEWER") return false;
  return role === "CONTRIBUTOR" && privacyLevel === "MEMBERS_ONLY";
}
