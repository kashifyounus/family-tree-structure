import type { Person } from "@prisma/client";
import type { PersonSummary } from "@/types/family";
import { calculateAge, isLivingFromDates } from "@/lib/age";

export function toPersonSummary(person: Person): PersonSummary {
  const birthIso = person.birthDate?.toISOString() ?? null;
  const deathIso = person.deathDate?.toISOString() ?? null;
  return {
    id: person.id,
    familyCode: person.familyCode,
    title: person.title,
    firstName: person.firstName,
    lastName: person.lastName,
    nickname: person.nickname,
    urduFirstName: person.urduFirstName,
    urduLastName: person.urduLastName,
    gender: person.gender,
    birthDate: birthIso,
    deathDate: deathIso,
    photoUrl: person.photoUrl,
    bio: person.bio,
    isLiving: isLivingFromDates(deathIso),
    age: calculateAge(birthIso, deathIso),
    occupation: person.occupation,
    motherTongue: person.motherTongue,
    privacyLevel: person.privacyLevel,
    birthPlace: person.birthPlace,
    currentCity: person.currentCity,
    permanentCity: person.permanentCity,
    homeTown: person.homeTown,
  };
}

export function birthYearFromPerson(person: Person): number | null {
  return person.birthDate ? person.birthDate.getFullYear() : null;
}

export function formatUrduName(person: PersonSummary): string | null {
  if (!person.urduFirstName && !person.urduLastName) return null;
  return [person.urduFirstName, person.urduLastName].filter(Boolean).join(" ");
}

export function formatEnglishDisplayName(person: PersonSummary): string {
  const parts = [
    person.title,
    person.firstName,
    person.nickname ? `"${person.nickname}"` : null,
    person.lastName,
  ].filter(Boolean);
  return parts.join(" ");
}
