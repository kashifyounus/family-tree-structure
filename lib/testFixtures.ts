import type { Gender, Person, PrivacyLevel } from "@prisma/client";
import type { UnionRecord } from "@/lib/kinship";

const defaultPrivacy: PrivacyLevel = "MEMBERS_ONLY";

export function mockPerson(
  partial: Partial<Person> & {
    id: string;
    firstName: string;
    lastName: string;
    gender: Gender;
  },
): Person {
  const now = new Date();
  return {
    id: partial.id,
    familyCode: partial.familyCode ?? `FAM-${partial.id}`,
    title: partial.title ?? null,
    firstName: partial.firstName,
    lastName: partial.lastName,
    nickname: partial.nickname ?? null,
    urduFirstName: partial.urduFirstName ?? null,
    urduLastName: partial.urduLastName ?? null,
    gender: partial.gender,
    birthDate: partial.birthDate ?? null,
    deathDate: partial.deathDate ?? null,
    photoUrl: partial.photoUrl ?? null,
    bio: partial.bio ?? null,
    occupation: partial.occupation ?? null,
    motherTongue: partial.motherTongue ?? null,
    privacyLevel: partial.privacyLevel ?? defaultPrivacy,
    birthPlace: partial.birthPlace ?? null,
    currentCity: partial.currentCity ?? null,
    permanentCity: partial.permanentCity ?? null,
    homeTown: partial.homeTown ?? null,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

export function unionWithChildren(
  id: string,
  p1: Person,
  p2: Person,
  children: { child: Person; relationshipType?: string }[],
): UnionRecord {
  return {
    id,
    partner1Id: p1.id,
    partner2Id: p2.id,
    partner1: p1,
    partner2: p2,
    childships: children.map((c) => ({
      childId: c.child.id,
      child: c.child,
      relationshipType: c.relationshipType ?? "BIOLOGICAL",
    })),
  };
}
