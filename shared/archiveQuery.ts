/**
 * AND-only archive filters for custom Reports (shared web + mobile).
 */

export type ArchiveQueryField =
  | "gender"
  | "living"
  | "currentCity"
  | "homeTown"
  | "birthPlace"
  | "hasNickname";

export type ArchiveQueryClause = {
  field: ArchiveQueryField;
  value: string;
};

export type ArchiveQuery = {
  and: ArchiveQueryClause[];
};

export type ArchiveQueryablePerson = {
  gender?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  currentCity?: string | null;
  homeTown?: string | null;
  birthPlace?: string | null;
  nickname?: string | null;
};

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isLiving(person: ArchiveQueryablePerson): boolean {
  return !person.deathDate;
}

export function matchesArchiveQuery(
  person: ArchiveQueryablePerson,
  query: ArchiveQuery,
): boolean {
  if (!query.and.length) return true;
  for (const clause of query.and) {
    switch (clause.field) {
      case "gender": {
        if (norm(person.gender) !== norm(clause.value)) return false;
        break;
      }
      case "living": {
        const wantLiving = clause.value === "true" || clause.value === "1";
        if (isLiving(person) !== wantLiving) return false;
        break;
      }
      case "hasNickname": {
        const want = clause.value === "true" || clause.value === "1";
        const has = Boolean(person.nickname?.trim());
        if (has !== want) return false;
        break;
      }
      case "currentCity":
      case "homeTown":
      case "birthPlace": {
        const raw = person[clause.field];
        if (norm(raw) !== norm(clause.value)) return false;
        break;
      }
      default: {
        const _exhaustive: never = clause.field;
        return _exhaustive;
      }
    }
  }
  return true;
}

export function filterArchivePeople<T extends ArchiveQueryablePerson>(
  people: T[],
  query: ArchiveQuery,
): T[] {
  return people.filter((p) => matchesArchiveQuery(p, query));
}
