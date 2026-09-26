import {
  computeKinshipForPerson,
  getSiblings,
} from "@/lib/kinship/kinshipCore";
import type {
  ChildUnionContext,
  KinshipPerson,
  KinshipUnionRecord,
} from "@/lib/kinship/types";

function person(
  partial: Pick<KinshipPerson, "id" | "firstName" | "lastName" | "gender"> &
    Partial<KinshipPerson>,
): KinshipPerson {
  return {
    id: partial.id,
    familyCode: partial.familyCode ?? `FAM-${partial.id}`,
    firstName: partial.firstName,
    lastName: partial.lastName,
    nickname: partial.nickname ?? null,
    urduFirstName: partial.urduFirstName ?? null,
    urduLastName: partial.urduLastName ?? null,
    gender: partial.gender,
    birthDate: partial.birthDate ?? null,
    deathDate: partial.deathDate ?? null,
    currentCity: partial.currentCity ?? null,
    birthPlace: partial.birthPlace ?? null,
    homeTown: partial.homeTown ?? null,
    occupation: partial.occupation ?? null,
    bio: partial.bio ?? null,
  };
}

function union(
  id: string,
  p1: KinshipPerson,
  p2: KinshipPerson,
  children: { child: KinshipPerson; relationshipType?: string }[],
): KinshipUnionRecord {
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

describe("kinshipCore", () => {
  const father = person({
    id: "father",
    firstName: "Muhammad",
    lastName: "Khan",
    gender: "MALE",
  });
  const mother = person({
    id: "mother",
    firstName: "Fatima",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const wife2 = person({
    id: "wife2",
    firstName: "Ayesha",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const childA = person({
    id: "childA",
    firstName: "Hassan",
    lastName: "Khan",
    gender: "MALE",
  });
  const childB = person({
    id: "childB",
    firstName: "Zainab",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const halfChild = person({
    id: "childC",
    firstName: "Bilal",
    lastName: "Khan",
    gender: "MALE",
  });
  const stepChild = person({
    id: "childD",
    firstName: "Sara",
    lastName: "Khan",
    gender: "FEMALE",
  });

  const parentsUnion = union("u-parents", father, mother, [
    { child: childA },
    { child: childB },
  ]);
  const secondUnion = union("u-wife2", father, wife2, [
    { child: halfChild },
    { child: stepChild, relationshipType: "STEP" },
  ]);
  const allUnions = [parentsUnion, secondUnion];

  const childAAsChild: ChildUnionContext[] = [
    {
      unionId: parentsUnion.id,
      relationshipType: "BIOLOGICAL",
      union: {
        id: parentsUnion.id,
        partner1Id: father.id,
        partner2Id: mother.id,
        partner1: father,
        partner2: mother,
        children: parentsUnion.childships.map((c) => ({
          childId: c.childId,
          child: c.child,
        })),
      },
    },
  ];

  const peopleById = new Map(
    [father, mother, wife2, childA, childB, halfChild, stepChild].map((p) => [
      p.id,
      p,
    ]),
  );

  it("classifies full, half, and step siblings by degree", () => {
    const siblings = getSiblings(childA.id, childAAsChild, allUnions);
    expect(siblings.find((s) => s.person.id === childB.id)?.degree).toBe("full");
    expect(siblings.find((s) => s.person.id === halfChild.id)?.degree).toBe(
      "half",
    );
    expect(siblings.find((s) => s.person.id === stepChild.id)?.degree).toBe(
      "step",
    );
  });

  it("routes siblings into full, half, and step computed buckets", () => {
    const computed = computeKinshipForPerson(
      childA.id,
      childAAsChild,
      allUnions,
      peopleById,
    );
    expect(computed.fullSiblings.map((s) => s.id)).toContain(childB.id);
    expect(computed.halfSiblings.map((s) => s.id)).toContain(halfChild.id);
    expect(computed.stepSiblings.map((s) => s.id)).toContain(stepChild.id);
    expect(computed.halfSiblings.map((s) => s.id)).not.toContain(stepChild.id);
  });
});
