import {
  FEMALE_FIRST_NAMES,
  MALE_FIRST_NAMES,
  MIDDLE_INITIALS,
  OTHER_FIRST_NAMES,
  SURNAMES,
  WORLD_CITIES,
} from "./namePools";
import { mulberry32, pick, pickInt } from "./random";
import type {
  BuildHugeDemoDatasetOptions,
  DemoChildDraft,
  DemoChildRelationship,
  DemoDataset,
  DemoDatasetStats,
  DemoGender,
  DemoPersonDraft,
  DemoUnionDraft,
} from "./types";

const DEFAULT_TARGET = 2500;
const MIN_TARGET = 250;
const MAX_TARGET = 12_000;

function newId(prefix: string, n: number): string {
  return `${prefix}-${n.toString(36)}`;
}

function isoDate(year: number, month = 6, day = 15): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function ageInYears(birthYear: number, asOfYear = 2026): number {
  return asOfYear - birthYear;
}

function deathForPerson(
  rng: () => number,
  birthYear: number,
): string | null {
  const age = ageInYears(birthYear);
  if (age < 72) return null;
  if (age > 95) return isoDate(birthYear + pickInt(rng, 78, 94));
  if (rng() < 0.55) return null;
  return isoDate(birthYear + pickInt(rng, 72, Math.min(age - 1, 99)));
}

class UniqueNameFactory {
  private seq = 0;
  private used = new Set<string>();

  constructor(private readonly rng: () => number) {}

  next(gender: DemoGender, surname: string): { firstName: string; lastName: string } {
    for (let attempt = 0; attempt < 500; attempt++) {
      const n = this.seq++;
      const pool =
        gender === "MALE"
          ? MALE_FIRST_NAMES
          : gender === "FEMALE"
            ? FEMALE_FIRST_NAMES
            : OTHER_FIRST_NAMES;
      const base = pool[n % pool.length]!;
      const middle = MIDDLE_INITIALS[(n >> 6) % MIDDLE_INITIALS.length]!;
      const firstName =
        n < pool.length * MIDDLE_INITIALS.length
          ? `${base} ${middle}.`
          : `${base} ${middle}. ${n}`;
      const lastName = surname;
      const key = `${firstName}|${lastName}`.toLowerCase();
      if (!this.used.has(key)) {
        this.used.add(key);
        return { firstName, lastName };
      }
    }
    const fallback = `Member ${this.seq}`;
    this.used.add(`${fallback}|${surname}`);
    return { firstName: fallback, lastName: surname };
  }
}

type InternalPerson = DemoPersonDraft & { parentUnionId?: string; birthYear: number };

/**
 * Generates a large demo genealogy: unique names, cities, ages, and mixed relationship types.
 */
export function buildHugeDemoDataset(
  options: BuildHugeDemoDatasetOptions = {},
): DemoDataset {
  const targetPersons = Math.min(
    MAX_TARGET,
    Math.max(MIN_TARGET, options.targetPersons ?? DEFAULT_TARGET),
  );
  const seed = options.seed ?? 42_026;
  const rng = mulberry32(seed);

  const persons: InternalPerson[] = [];
  const unions: DemoUnionDraft[] = [];
  const children: DemoChildDraft[] = [];
  const names = new UniqueNameFactory(rng);

  let unionSeq = 0;
  let childSeq = 0;
  let remarriages = 0;

  function addPerson(
    gender: DemoGender,
    birthYear: number,
    surname: string,
    parentUnionId?: string,
  ): string {
    const { firstName, lastName } = names.next(gender, surname);
    const id = newId("p", persons.length);
    const city = pick(rng, WORLD_CITIES);
    persons.push({
      id,
      firstName,
      lastName,
      gender,
      birthDate: isoDate(birthYear, pickInt(rng, 1, 12), pickInt(rng, 1, 28)),
      deathDate: deathForPerson(rng, birthYear),
      currentCity: city,
      birthYear,
      parentUnionId,
    });
    return id;
  }

  function addUnion(
    a: string,
    b: string,
    marriageYear: number,
    isActive: boolean,
    divorceYear: number | null = null,
  ): string {
    const id = newId("u", unionSeq++);
    unions.push({
      id,
      partner1Id: a,
      partner2Id: b,
      marriageDate: isoDate(marriageYear),
      divorceDate: divorceYear ? isoDate(divorceYear) : null,
      isActive,
    });
    return id;
  }

  function linkChild(
    unionId: string,
    childId: string,
    relationshipType: DemoChildRelationship,
  ): void {
    children.push({
      id: newId("c", childSeq++),
      unionId,
      childId,
      relationshipType,
    });
  }

  function isLiving(personId: string): boolean {
    const p = persons.find((x) => x.id === personId);
    return p ? p.deathDate === null : false;
  }

  function personAge(personId: string): number {
    const p = persons.find((x) => x.id === personId);
    return p ? ageInYears(p.birthYear) : 0;
  }

  function pickGender(): DemoGender {
    const r = rng();
    if (r < 0.49) return "MALE";
    if (r < 0.98) return "FEMALE";
    return "OTHER";
  }

  // —— Clan forests until we approach target ——
  let clan = 0;
  while (persons.length < targetPersons * 0.92) {
    const clanSurname = SURNAMES[clan % SURNAMES.length]!;
    clan += 1;
    const founderBirth = pickInt(rng, 1938, 1962);
    const founderGender: DemoGender = rng() < 0.52 ? "MALE" : "FEMALE";
    const spouseGender: DemoGender =
      founderGender === "MALE" ? "FEMALE" : founderGender === "FEMALE" ? "MALE" : pickGender();

    const founderId = addPerson(founderGender, founderBirth, clanSurname);
    const spouseId = addPerson(spouseGender, founderBirth + pickInt(rng, -3, 4), clanSurname);
    const rootUnion = addUnion(
      founderId,
      spouseId,
      founderBirth + pickInt(rng, 20, 28),
      true,
    );

    type Frontier = { unionId: string; generation: number };
    const frontier: Frontier[] = [{ unionId: rootUnion, generation: 0 }];

    while (frontier.length > 0 && persons.length < targetPersons * 0.92) {
      const { unionId, generation } = frontier.shift()!;
      const numChildren = pickInt(rng, 2, generation < 2 ? 6 : 4);
      const childIds: string[] = [];

      for (let c = 0; c < numChildren; c++) {
        if (persons.length >= targetPersons * 0.92) break;
        const childGender = pickGender();
        const childBirth =
          generation === 0
            ? founderBirth + pickInt(rng, 22, 38) + c
            : pickInt(rng, 1965, 2018);
        const childId = addPerson(childGender, childBirth, clanSurname, unionId);
        const rel: DemoChildRelationship =
          rng() < 0.04 ? "ADOPTED" : rng() < 0.07 ? "STEP" : "BIOLOGICAL";
        linkChild(unionId, childId, rel);
        childIds.push(childId);
      }

      for (const childId of childIds) {
        if (persons.length >= targetPersons * 0.92) break;
        const age = personAge(childId);
        if (age < 20 || age > 55 || !isLiving(childId)) continue;
        if (rng() > 0.62) continue;

        const spouseGender =
          persons.find((p) => p.id === childId)?.gender === "MALE"
            ? "FEMALE"
            : persons.find((p) => p.id === childId)?.gender === "FEMALE"
              ? "MALE"
              : pickGender();
        const spouseSurname = pick(rng, SURNAMES);
        const spouseBirth =
          (persons.find((p) => p.id === childId)?.birthYear ?? 1980) +
          pickInt(rng, -4, 5);
        const spouseId = addPerson(spouseGender, spouseBirth, spouseSurname);
        const marriageYear = Math.max(
          spouseBirth + 18,
          (persons.find((p) => p.id === childId)?.birthYear ?? 1980) + 20,
        );
        const u = addUnion(childId, spouseId, marriageYear, true);
        frontier.push({ unionId: u, generation: generation + 1 });
      }
    }
  }

  // —— Remarriage / step-family (inactive union + new partner) ——
  const remarriageCandidates = persons.filter(
    (p) => personAge(p.id) >= 35 && personAge(p.id) <= 70 && isLiving(p.id),
  );
  const remarriageCap = Math.min(45, Math.floor(targetPersons / 80));
  for (let i = 0; i < remarriageCap && i < remarriageCandidates.length; i++) {
    const person = remarriageCandidates[i]!;
    const existing = unions.find(
      (u) =>
        u.isActive &&
        (u.partner1Id === person.id || u.partner2Id === person.id),
    );
    if (!existing || rng() > 0.35) continue;

    existing.isActive = false;
    existing.divorceDate = isoDate(person.birthYear + pickInt(rng, 38, 55));
    remarriages += 1;

    const newSpouseGender =
      person.gender === "MALE"
        ? "FEMALE"
        : person.gender === "FEMALE"
          ? "MALE"
          : pickGender();
    const newSpouseId = addPerson(
      newSpouseGender,
      person.birthYear + pickInt(rng, -2, 8),
      pick(rng, SURNAMES),
    );
    const newUnion = addUnion(
      person.id,
      newSpouseId,
      person.birthYear + pickInt(rng, 40, 58),
      true,
    );
    if (rng() < 0.7 && persons.length < targetPersons) {
      const stepChild = addPerson(
        pickGender(),
        person.birthYear + pickInt(rng, 42, 52),
        person.lastName,
        newUnion,
      );
      linkChild(newUnion, stepChild, "STEP");
    }
  }

  // —— Cousin marriages across clans ——
  const youngAdults = persons.filter(
    (p) => personAge(p.id) >= 22 && personAge(p.id) <= 40 && isLiving(p.id),
  );
  const cousinCap = Math.min(30, Math.floor(targetPersons / 100));
  for (let i = 0; i < cousinCap - 1; i += 2) {
    const a = youngAdults[i];
    const b = youngAdults[i + 1];
    if (!a || !b || a.id === b.id) continue;
    if (unions.some(
      (u) =>
        (u.partner1Id === a.id && u.partner2Id === b.id) ||
        (u.partner1Id === b.id && u.partner2Id === a.id),
    )) {
      continue;
    }
    addUnion(a.id, b.id, Math.max(a.birthYear, b.birthYear) + pickInt(rng, 22, 28), true);
  }

  // —— Top up with additional leaf people (distant relatives) ——
  while (persons.length < targetPersons) {
    const anchor = pick(rng, persons);
    const childGender = pickGender();
    const birthYear = anchor.birthYear + pickInt(rng, 18, 35);
    const childId = addPerson(childGender, birthYear, anchor.lastName);
    const parentUnion = unions.find(
      (u) => u.partner1Id === anchor.id || u.partner2Id === anchor.id,
    );
    if (parentUnion) {
      linkChild(parentUnion.id, childId, "BIOLOGICAL");
    }
  }

  const uniqueFullNames = new Set(
    persons.map((p) => `${p.firstName} ${p.lastName}`.toLowerCase()),
  );
  const uniqueCities = new Set(persons.map((p) => p.currentCity));

  const focal =
    persons.find(
      (p) => p.firstName.startsWith("Hassan") && p.lastName === "Khan",
    ) ??
    persons.find((p) => p.gender === "MALE" && personAge(p.id) >= 28 && personAge(p.id) <= 55) ??
    persons[0]!;

  const stats: DemoDatasetStats = {
    persons: persons.length,
    unions: unions.length,
    childLinks: children.length,
    biological: children.filter((c) => c.relationshipType === "BIOLOGICAL").length,
    adopted: children.filter((c) => c.relationshipType === "ADOPTED").length,
    step: children.filter((c) => c.relationshipType === "STEP").length,
    activeUnions: unions.filter((u) => u.isActive).length,
    remarriages,
    uniqueFullNames: uniqueFullNames.size,
    uniqueCities: uniqueCities.size,
  };

  const publicPersons: DemoPersonDraft[] = persons.map(
    ({ parentUnionId: _p, birthYear: _b, ...rest }) => rest,
  );

  return {
    version: 1,
    seed,
    targetPersons,
    focalPersonId: focal.id,
    persons: publicPersons,
    unions,
    children,
    stats,
  };
}
