import type { Person } from "@prisma/client";
import type { PersonSummary } from "@/types/family";

export function toPersonSummary(person: Person): PersonSummary {
  return {
    id: person.id,
    familyCode: person.familyCode,
    firstName: person.firstName,
    lastName: person.lastName,
    gender: person.gender,
    birthDate: person.birthDate?.toISOString() ?? null,
    deathDate: person.deathDate?.toISOString() ?? null,
    photoUrl: person.photoUrl,
    bio: person.bio,
    isLiving: person.isLiving,
    privacyLevel: person.privacyLevel,
  };
}

export function birthYearFromPerson(person: Person): number | null {
  return person.birthDate ? person.birthDate.getFullYear() : null;
}
