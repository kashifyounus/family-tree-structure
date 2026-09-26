import { computeRelationSummary } from "@/lib/kinship/relationshipPath";

jest.mock("@/lib/db/kinshipLoader", () => ({
  loadKinshipDataset: () => {
    const father = {
      id: "f",
      firstName: "Ali",
      lastName: "Khan",
      gender: "MALE" as const,
      familyCode: "F1",
      birthDate: null,
      deathDate: null,
      isLiving: true,
    };
    const child = {
      id: "c",
      firstName: "Sara",
      lastName: "Khan",
      gender: "FEMALE" as const,
      familyCode: "F2",
      birthDate: null,
      deathDate: null,
      isLiving: true,
    };
    const peopleById = new Map<string, typeof father | typeof child>([
      ["f", father],
      ["c", child],
    ]);
    return {
      peopleById,
      allUnions: [
        {
          id: "u1",
          partner1Id: "f",
          partner2Id: "m",
          partner1: father,
          partner2: {
            id: "m",
            firstName: "Fatima",
            lastName: "Khan",
            gender: "FEMALE" as const,
            familyCode: "F3",
            birthDate: null,
            deathDate: null,
            isLiving: true,
          },
          childships: [{ childId: "c", relationshipType: "BIOLOGICAL", child }],
        },
      ],
    };
  },
}));

describe("computeRelationSummary", () => {
  it("returns a plain kinship label instead of an edge chain", () => {
    expect(computeRelationSummary("f", "c")).toBe("Daughter");
  });
});
