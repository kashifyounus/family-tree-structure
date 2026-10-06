/**
 * B1: which marriage row to show when a person has multiple unions.
 */

export function resolvePrimaryTreeUnionId(
  preferredUnionId: string | null | undefined,
  personUnionIds: readonly string[],
): string | null {
  if (!preferredUnionId) return null;
  return personUnionIds.includes(preferredUnionId) ? preferredUnionId : null;
}
