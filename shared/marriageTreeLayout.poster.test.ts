import { layoutMarriageCentricGraph } from "./marriageTreeLayout";

describe("marriageTreeLayout poster ancestors", () => {
  const unions = [
    {
      id: "u1",
      partner1Id: "ego",
      partner2Id: "spouse",
      childships: [],
    },
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }],
    },
    {
      id: "u-gp",
      partner1Id: "gpa",
      partner2Id: "gma",
      childships: [{ childId: "dad" }],
    },
  ];

  const people = new Map(
    ["ego", "spouse", "dad", "mom", "gpa", "gma"].map((id) => [
      id,
      { id, birthDate: "1980-01-01", gender: "MALE" as const },
    ]),
  );

  it("stacks grandparents when maxAncestorGenerations >= 2", () => {
    const included = new Set(["ego", "spouse", "dad", "mom", "gpa", "gma"]);
    const deep = layoutMarriageCentricGraph(
      "ego",
      people,
      unions,
      included,
      0,
      0,
      { phoneSingleParentSide: false, maxAncestorGenerations: 2 },
    );
    const gpaY = deep.positions.get("gpa")?.y;
    const dadY = deep.positions.get("dad")?.y;
    expect(gpaY).toBeDefined();
    expect(dadY).toBeDefined();
    expect(gpaY!).toBeLessThan(dadY!);
  });
});
