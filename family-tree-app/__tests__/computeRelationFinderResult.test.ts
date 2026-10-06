import { computeRelationFinderResult } from "@/lib/kinship/relationPaths";
import { saveKinshipLabelLocale } from "@/lib/settings/kinshipLocale";
import type { KinshipPerson } from "@/lib/kinship/types";

jest.mock("@/lib/db/kinshipLoader", () => {
  const father = {
    id: "f",
    familyCode: "FAM-f",
    firstName: "Ali",
    lastName: "Khan",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: "MALE" as const,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
  const mother = {
    id: "m",
    familyCode: "FAM-m",
    firstName: "Fatima",
    lastName: "Khan",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: "FEMALE" as const,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
  const child = {
    id: "c",
    familyCode: "FAM-c",
    firstName: "Sara",
    lastName: "Khan",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: "FEMALE" as const,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
  const peopleById = new Map<string, KinshipPerson>([
    ["f", father],
    ["m", mother],
    ["c", child],
  ]);
  return {
    loadKinshipDataset: () => ({
      peopleById,
      allUnions: [
        {
          id: "u1",
          partner1Id: "f",
          partner2Id: "m",
          partner1: father,
          partner2: mother,
          childships: [
            { childId: "c", child, relationshipType: "BIOLOGICAL" },
          ],
        },
      ],
    }),
  };
});

describe("computeRelationFinderResult", () => {
  it("returns kinship summary and path metadata for parent and child", () => {
    const result = computeRelationFinderResult("f", "c");
    expect(result.ok).toBe(true);
    expect(result.summaries[0]).toMatch(/daughter/i);
    expect(result.message).toMatch(/\d+ paths?/);
    expect(result.nodeIdsOnPaths).toContain("f");
    expect(result.nodeIdsOnPaths).toContain("c");
    expect(result.edgeKeysOnPaths.length).toBeGreaterThan(0);
  });

  it("fails when a person id is missing from the archive", () => {
    const result = computeRelationFinderResult("f", "missing");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("could not find");
  });
});
