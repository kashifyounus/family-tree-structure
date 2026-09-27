import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
  sortByBirthOldestFirst,
} from "./marriageTreeLayout";

describe("marriageTreeLayout", () => {
  const unions = [
    {
      id: "u1",
      partner1Id: "ego",
      partner2Id: "spouse",
      childships: [{ childId: "c1" }, { childId: "c2" }],
    },
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }, { childId: "sib" }],
    },
  ];

  const people = new Map([
    { id: "ego", birthDate: "1980-01-01" },
    { id: "spouse", birthDate: "1982-01-01" },
    { id: "c1", birthDate: "2010-01-01" },
    { id: "c2", birthDate: "2005-01-01" },
    { id: "dad", birthDate: "1950-01-01" },
    { id: "mom", birthDate: "1952-01-01" },
    { id: "sib", birthDate: "1985-01-01" },
  ].map((p) => [p.id, p]));

  it("sorts children oldest first", () => {
    const sorted = sortByBirthOldestFirst([
      { id: "c1", birthDate: "2010-01-01" },
      { id: "c2", birthDate: "2005-01-01" },
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["c2", "c1"]);
  });

  it("includes siblings when siblingSteps > 0", () => {
    const included = collectIncludedPersonIds("ego", unions, 1, 1, 1);
    expect(included.has("sib")).toBe(true);
  });

  it("places spouse on marriage row and children below", () => {
    const included = collectIncludedPersonIds("ego", unions, 1, 1, 1);
    const { positions, edges, focalUnionId, focalUnionIds } =
      layoutMarriageCentricGraph("ego", people, unions, included);
    expect(positions.get("spouse")!.y).toBe(positions.get("ego")!.y);
    expect(positions.get("c2")!.y).toBeGreaterThan(positions.get("ego")!.y);
    expect(positions.get("sib")!.x).toBeLessThan(positions.get("ego")!.x);
    expect(edges.some((e) => e.type === "spouse")).toBe(true);
    expect(focalUnionId).toBe("u1");
    expect(focalUnionIds).toContain("u1");
    expect(edges.find((e) => e.type === "spouse")?.label).toBe("u1");
  });

  it("places husband siblings on the left wing when focal is the wife", () => {
    const spouseLineUnions = [
      ...unions,
      {
        id: "u-spouse-parents",
        partner1Id: "dad2",
        partner2Id: "mom2",
        childships: [{ childId: "spouse" }, { childId: "husbSib" }],
      },
    ];
    const genderedPeople = new Map(
      [
        { id: "ego", birthDate: "1982-01-01", gender: "FEMALE" },
        { id: "spouse", birthDate: "1980-01-01", gender: "MALE" },
        { id: "husbSib", birthDate: "1985-01-01", gender: "MALE" },
        { id: "c1", birthDate: "2010-01-01", gender: "MALE" },
        { id: "c2", birthDate: "2005-01-01", gender: "FEMALE" },
        { id: "dad", birthDate: "1950-01-01", gender: "MALE" },
        { id: "mom", birthDate: "1952-01-01", gender: "FEMALE" },
        { id: "dad2", birthDate: "1951-01-01", gender: "MALE" },
        { id: "mom2", birthDate: "1953-01-01", gender: "FEMALE" },
      ].map((p) => [p.id, p]),
    );

    const included = collectIncludedPersonIds("ego", spouseLineUnions, 2, 1, 1);
    included.add("husbSib");
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      genderedPeople,
      spouseLineUnions,
      included,
    );
    const husbandX = positions.get("spouse")!.x;
    const wifeX = positions.get("ego")!.x;
    const husbSibX = positions.get("husbSib")!.x;
    expect(husbandX).toBeLessThan(wifeX);
    expect(husbSibX).toBeLessThan(husbandX);
  });
});
