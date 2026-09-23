export function calculateAge(
  birthDate: string | Date | null,
  deathDate?: string | Date | null,
): number | null {
  if (!birthDate) return null;
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const end =
    deathDate != null
      ? deathDate instanceof Date
        ? deathDate
        : new Date(deathDate)
      : new Date();

  if (Number.isNaN(end.getTime())) return null;

  let age = end.getFullYear() - birth.getFullYear();
  const monthDelta = end.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function isLivingFromDates(deathDate: string | Date | null): boolean {
  return deathDate == null;
}
