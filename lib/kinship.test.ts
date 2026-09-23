import {
  computeAuntsAndUncles,
  computeRelationshipPath,
  getSiblings,
  type UnionRecord,
} from "@/lib/kinship";
import { mockPerson, unionWithChildren } from "@/lib/testFixtures";

describe("kinship engine", () => {
  const grandfather = mockPerson({
    id: "gp",
    firstName: "Yusuf",
    lastName: "Khan",
    gender: "MALE",
  });
  const grandmother = mockPerson({
    id: "gm",
    firstName: "Khadija",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const father = mockPerson({
    id: "father",
    firstName: "Muhammad",
    lastName: "Khan",
    gender: "MALE",
  });
  const mother = mockPerson({
    id: "mother",
    firstName: "Fatima",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const wife2 = mockPerson({
    id: "wife2",
    firstName: "Ayesha",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const paternalUncle = mockPerson({
    id: "uncle",
    firstName: "Imran",
    lastName: "Khan",
    gender: "MALE",
  });
  const childA = mockPerson({
    id: "childA",
    firstName: "Hassan",
    lastName: "Khan",
    gender: "MALE",
  });
  const childB = mockPerson({
    id: "childB",
    firstName: "Zainab",
    lastName: "Khan",
    gender: "FEMALE",
  });
  const halfChild = mockPerson({
    id: "childC",
    firstName: "Bilal",
    lastName: "Khan",
    gender: "MALE",
  });

  const gpUnion = unionWithChildren("u-gp", grandfather, grandmother, [
    { child: father },
    { child: paternalUncle },
  ]);
  const parentsUnion = unionWithChildren("u-parents", father, mother, [
    { child: childA },
    { child: childB },
  ]);
  const secondUnion = unionWithChildren("u-wife2", father, wife2, [
    { child: halfChild },
  ]);

  const allUnions: UnionRecord[] = [gpUnion, parentsUnion, secondUnion];

  const childAAsChild = [
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

  it("identifies full siblings sharing the same union", () => {
    const siblings = getSiblings(childA.id, childAAsChild, allUnions);
    const full = siblings.filter((s) => s.degree === "full");
    expect(full.map((s) => s.person.id)).toContain(childB.id);
    expect(full.map((s) => s.person.id)).not.toContain(halfChild.id);
  });

  it("identifies half-siblings through father's second union", () => {
    const siblings = getSiblings(childA.id, childAAsChild, allUnions);
    const half = siblings.find((s) => s.person.id === halfChild.id);
    expect(half?.degree).toBe("half");
  });

  it("resolves paternal uncle and maternal side (empty when mother has no siblings in graph)", () => {
    const peopleById = new Map(
      [
        grandfather,
        grandmother,
        father,
        mother,
        paternalUncle,
        childA,
        childB,
        halfChild,
        wife2,
      ].map((p) => [p.id, p]),
    );

    const computed = computeAuntsAndUncles(
      childA.id,
      childAAsChild,
      allUnions,
      peopleById,
    );

    expect(computed.paternalUncles.map((u) => u.id)).toContain(paternalUncle.id);
    expect(computed.maternalUncles).toHaveLength(0);
    expect(computed.fullSiblings.map((s) => s.id)).toContain(childB.id);
    expect(computed.halfSiblings.map((s) => s.id)).toContain(halfChild.id);
  });

  it("finds relationship path via BFS between grandparent and grandchild", () => {
    const people = [
      grandfather,
      grandmother,
      father,
      mother,
      childA,
      paternalUncle,
    ];
    const path = computeRelationshipPath(
      grandfather,
      childA,
      people,
      allUnions,
    );
    expect(path.steps.length).toBeGreaterThan(0);
    expect(path.summary).not.toBe("No path found in the family graph");
    const lastStep = path.steps[path.steps.length - 1];
    expect(lastStep.toId).toBe(childA.id);
  });
});
