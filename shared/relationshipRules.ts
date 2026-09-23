/**
 * Relationship rules shared by the web app, mobile archive, and API.
 * Messages in this file are safe to show to family administrators.
 */

export type RuleGender = "MALE" | "FEMALE" | "OTHER";

export type RulePerson = {
  id: string;
  gender: RuleGender;
  birthDate: string | null;
  deathDate: string | null;
};

export type RuleUnion = {
  id: string;
  partner1Id: string;
  partner2Id: string;
  marriageDate: string | null;
  divorceDate: string | null;
  childIds: string[];
};

export type RuleGraph = {
  people: RulePerson[];
  unions: RuleUnion[];
};

export type RuleCode =
  | "NOT_FOUND"
  | "SELF_LINK"
  | "DUPLICATE_MARRIAGE"
  | "ANCESTOR_MARRIAGE"
  | "SPOUSE_AS_PARENT"
  | "DESCENDANT_AS_PARENT"
  | "CHILD_IS_PARTNER"
  | "DUPLICATE_CHILD"
  | "PARENTS_MUST_DIFFER"
  | "DATE_DEATH_BEFORE_BIRTH"
  | "DATE_DIVORCE_BEFORE_MARRIAGE"
  | "DATE_MARRIAGE_BEFORE_BIRTH"
  | "DATE_MARRIAGE_AFTER_DEATH"
  | "MARRIAGE_MISSING";

export const ruleMessages = {
  notFound: "This person is no longer in the family records.",
  marriageMissing: "This marriage is no longer in the family records.",
  selfSpouse: "A person cannot be recorded as their own spouse.",
  selfParent: "A person cannot be recorded as their own parent.",
  duplicateMarriage: "These two people already have a marriage recorded.",
  ancestorMarriage:
    "This marriage cannot be saved because one person is already a direct ancestor of the other.",
  spouseAsParent: "A spouse cannot also be recorded as this person's parent.",
  descendantAsParent: "A descendant cannot be recorded as this person's parent.",
  childIsPartner:
    "A person cannot be both a spouse and a child in the same marriage.",
  duplicateChild: "This person is already recorded as a child of this marriage.",
  parentsMustDiffer: "Choose two different people as parents.",
  deathBeforeBirth: "The date of death cannot be earlier than the date of birth.",
  divorceBeforeMarriage:
    "The divorce date cannot be earlier than the marriage date.",
  marriageBeforeBirth:
    "The marriage date cannot be earlier than either person's date of birth.",
  marriageAfterDeath:
    "The marriage date cannot be later than either person's date of death.",
  savePerson:
    "Unable to save the person details. Please review the highlighted fields and try again.",
  saveMarriage:
    "Unable to save the marriage. Please review the dates and try again.",
  saveRelationship:
    "Unable to save this relationship. Please review the people you selected and try again.",
} as const;

export class RelationshipRuleError extends Error {
  readonly code: RuleCode;
  readonly userMessage: string;

  constructor(code: RuleCode, userMessage: string) {
    super(userMessage);
    this.name = "RelationshipRuleError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

export function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  if (match) return match[1];
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function defaultSpouseGender(gender: RuleGender): RuleGender | null {
  switch (gender) {
    case "MALE":
      return "FEMALE";
    case "FEMALE":
      return "MALE";
    case "OTHER":
      return null;
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}

/** Stable pair so A–B and B–A are treated as the same marriage. */
export function canonicalPartnerIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function findMarriage(
  graph: RuleGraph,
  personA: string,
  personB: string,
): RuleUnion | undefined {
  return graph.unions.find(
    (union) =>
      (union.partner1Id === personA && union.partner2Id === personB) ||
      (union.partner1Id === personB && union.partner2Id === personA),
  );
}

function personById(graph: RuleGraph, id: string): RulePerson | undefined {
  return graph.people.find((person) => person.id === id);
}

function parentIdsOf(graph: RuleGraph, personId: string): string[] {
  const ids = new Set<string>();
  for (const union of graph.unions) {
    if (!union.childIds.includes(personId)) continue;
    ids.add(union.partner1Id);
    ids.add(union.partner2Id);
  }
  ids.delete(personId);
  return [...ids];
}

export function ancestorIds(graph: RuleGraph, personId: string): Set<string> {
  const seen = new Set<string>();
  const stack = parentIdsOf(graph, personId);
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    stack.push(...parentIdsOf(graph, id));
  }
  return seen;
}

export function descendantIds(graph: RuleGraph, personId: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const union of graph.unions) {
    for (const parentId of [union.partner1Id, union.partner2Id]) {
      const list = childrenOf.get(parentId) ?? [];
      list.push(...union.childIds);
      childrenOf.set(parentId, list);
    }
  }
  const seen = new Set<string>();
  const stack = [...(childrenOf.get(personId) ?? [])];
  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    stack.push(...(childrenOf.get(id) ?? []));
  }
  return seen;
}

function spouseIds(graph: RuleGraph, personId: string): Set<string> {
  const ids = new Set<string>();
  for (const union of graph.unions) {
    if (union.partner1Id === personId) ids.add(union.partner2Id);
    if (union.partner2Id === personId) ids.add(union.partner1Id);
  }
  return ids;
}

export function assertLifeDates(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined,
): void {
  const birth = dateOnly(birthDate);
  const death = dateOnly(deathDate);
  if (birth && death && death < birth) {
    throw new RelationshipRuleError(
      "DATE_DEATH_BEFORE_BIRTH",
      ruleMessages.deathBeforeBirth,
    );
  }
}

export function assertMarriageTimeline(input: {
  marriageDate?: string | null;
  divorceDate?: string | null;
  births?: (string | null | undefined)[];
  deaths?: (string | null | undefined)[];
}): void {
  const marriage = dateOnly(input.marriageDate);
  const divorce = dateOnly(input.divorceDate);
  if (marriage && divorce && divorce < marriage) {
    throw new RelationshipRuleError(
      "DATE_DIVORCE_BEFORE_MARRIAGE",
      ruleMessages.divorceBeforeMarriage,
    );
  }
  if (!marriage) return;
  for (const birth of input.births ?? []) {
    const value = dateOnly(birth);
    if (value && marriage < value) {
      throw new RelationshipRuleError(
        "DATE_MARRIAGE_BEFORE_BIRTH",
        ruleMessages.marriageBeforeBirth,
      );
    }
  }
  for (const death of input.deaths ?? []) {
    const value = dateOnly(death);
    if (value && marriage > value) {
      throw new RelationshipRuleError(
        "DATE_MARRIAGE_AFTER_DEATH",
        ruleMessages.marriageAfterDeath,
      );
    }
  }
}

function requirePerson(graph: RuleGraph, id: string): RulePerson {
  const person = personById(graph, id);
  if (!person) {
    throw new RelationshipRuleError("NOT_FOUND", ruleMessages.notFound);
  }
  return person;
}

export function assertCanCreateMarriage(
  graph: RuleGraph,
  personId: string,
  spouseId: string,
  marriageDate?: string | null,
): void {
  if (personId === spouseId) {
    throw new RelationshipRuleError("SELF_LINK", ruleMessages.selfSpouse);
  }
  const person = requirePerson(graph, personId);
  const spouse = requirePerson(graph, spouseId);
  if (findMarriage(graph, personId, spouseId)) {
    throw new RelationshipRuleError(
      "DUPLICATE_MARRIAGE",
      ruleMessages.duplicateMarriage,
    );
  }
  const personAncestors = ancestorIds(graph, personId);
  const spouseAncestors = ancestorIds(graph, spouseId);
  if (personAncestors.has(spouseId) || spouseAncestors.has(personId)) {
    throw new RelationshipRuleError(
      "ANCESTOR_MARRIAGE",
      ruleMessages.ancestorMarriage,
    );
  }
  assertMarriageTimeline({
    marriageDate,
    births: [person.birthDate, spouse.birthDate],
    deaths: [person.deathDate, spouse.deathDate],
  });
}

export function assertCanAttachChild(
  graph: RuleGraph,
  unionId: string,
  childId: string,
): void {
  const union = graph.unions.find((item) => item.id === unionId);
  if (!union) {
    throw new RelationshipRuleError("MARRIAGE_MISSING", ruleMessages.marriageMissing);
  }
  requirePerson(graph, childId);
  if (union.partner1Id === childId || union.partner2Id === childId) {
    throw new RelationshipRuleError("CHILD_IS_PARTNER", ruleMessages.childIsPartner);
  }
  if (union.childIds.includes(childId)) {
    throw new RelationshipRuleError("DUPLICATE_CHILD", ruleMessages.duplicateChild);
  }
  const ancestors = ancestorIds(graph, union.partner1Id);
  const otherAncestors = ancestorIds(graph, union.partner2Id);
  if (ancestors.has(childId) || otherAncestors.has(childId)) {
    throw new RelationshipRuleError(
      "ANCESTOR_MARRIAGE",
      ruleMessages.ancestorMarriage,
    );
  }
}

export function assertCanAssignParents(
  graph: RuleGraph,
  childId: string,
  parentAId: string,
  parentBId: string,
): void {
  requirePerson(graph, childId);
  requirePerson(graph, parentAId);
  requirePerson(graph, parentBId);
  if (parentAId === parentBId) {
    throw new RelationshipRuleError(
      "PARENTS_MUST_DIFFER",
      ruleMessages.parentsMustDiffer,
    );
  }
  if (parentAId === childId || parentBId === childId) {
    throw new RelationshipRuleError("SELF_LINK", ruleMessages.selfParent);
  }
  const spouses = spouseIds(graph, childId);
  if (spouses.has(parentAId) || spouses.has(parentBId)) {
    throw new RelationshipRuleError("SPOUSE_AS_PARENT", ruleMessages.spouseAsParent);
  }
  const descendants = descendantIds(graph, childId);
  if (descendants.has(parentAId) || descendants.has(parentBId)) {
    throw new RelationshipRuleError(
      "DESCENDANT_AS_PARENT",
      ruleMessages.descendantAsParent,
    );
  }
}

export function assertPersonDatesAgainstMarriages(
  graph: RuleGraph,
  personId: string,
  birthDate: string | null | undefined,
  deathDate: string | null | undefined,
): void {
  assertLifeDates(birthDate, deathDate);
  const person = personById(graph, personId);
  for (const union of graph.unions) {
    const isPartner =
      union.partner1Id === personId || union.partner2Id === personId;
    if (!isPartner) continue;
    const otherId =
      union.partner1Id === personId ? union.partner2Id : union.partner1Id;
    const other = personById(graph, otherId);
    assertMarriageTimeline({
      marriageDate: union.marriageDate,
      divorceDate: union.divorceDate,
      births: [birthDate, other?.birthDate],
      deaths: [deathDate ?? person?.deathDate, other?.deathDate],
    });
  }
}

const TECHNICAL =
  /prisma|invocation|sql|stack trace|econn|\/api\/|status code|sqlite_|typeerror|cannot read propert|invalid `prisma|password authentication/i;

export function toUserFacingMessage(error: unknown, fallback: string): string {
  if (error instanceof RelationshipRuleError) return error.userMessage;
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && !TECHNICAL.test(message) && message.length < 280) {
      return message;
    }
  }
  return fallback;
}
