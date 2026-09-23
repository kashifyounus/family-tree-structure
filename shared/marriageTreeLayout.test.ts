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
    const { positions, edges } = layoutMarriageCentricGraph(
      "ego",
      people,
      unions,
      included,
    );
    expect(positions.get("spouse")!.y).toBe(positions.get("ego")!.y);
    expect(positions.get("c2")!.y).toBeGreaterThan(positions.get("ego")!.y);
    expect(positions.get("sib")!.x).toBeLessThan(positions.get("ego")!.x);
    expect(edges.some((e) => e.type === "spouse")).toBe(true);
  });
});
