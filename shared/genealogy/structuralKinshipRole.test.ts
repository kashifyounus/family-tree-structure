import {
  structuralKinshipLabelForLocale,
  type StructuralKinshipUnion,
} from "./structuralKinshipRole";

const people = new Map([
  ["f", { id: "f", gender: "MALE" as const }],
  ["w", { id: "w", gender: "FEMALE" as const }],
  ["c1", { id: "c1", gender: "FEMALE" as const }],
  ["c2", { id: "c2", gender: "MALE" as const }],
  ["p", { id: "p", gender: "MALE" as const }],
  ["mom", { id: "mom", gender: "FEMALE" as const }],
]);

const unions: StructuralKinshipUnion[] = [
  {
    partner1Id: "f",
    partner2Id: "w",
    childships: [
      { childId: "c1", relationshipType: "BIOLOGICAL" },
      { childId: "c2", relationshipType: "BIOLOGICAL" },
    ],
  },
  {
    partner1Id: "p",
    partner2Id: "mom",
    childships: [{ childId: "f", relationshipType: "BIOLOGICAL" }],
  },
];

describe("structuralKinshipRole", () => {
  it("labels focal children consistently", () => {
    expect(
      structuralKinshipLabelForLocale("f", "c1", people, unions, "en"),
    ).toBe("Daughter");
    expect(
      structuralKinshipLabelForLocale("f", "c2", people, unions, "en"),
    ).toBe("Son");
  });

  it("labels spouse and parent", () => {
    expect(
      structuralKinshipLabelForLocale("f", "w", people, unions, "en"),
    ).toBe("Wife");
    expect(
      structuralKinshipLabelForLocale("f", "p", people, unions, "en"),
    ).toBe("Father");
  });
});
