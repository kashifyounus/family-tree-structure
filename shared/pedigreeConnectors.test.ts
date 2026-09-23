import { buildPedigreeConnectorSegments } from "./pedigreeConnectors";

describe("pedigreeConnectors", () => {
  const nodes = [
    { id: "ego", x: 0, y: 0, width: 100, height: 60 },
    { id: "spouse", x: 200, y: 0, width: 100, height: 60 },
    { id: "c1", x: 80, y: 160, width: 100, height: 60 },
    { id: "c2", x: 220, y: 160, width: 100, height: 60 },
  ];

  it("draws couple bar and T-junction drops for children of a union", () => {
    const segments = buildPedigreeConnectorSegments(nodes, [
      {
        id: "s1",
        source: "ego",
        target: "spouse",
        type: "spouse",
        label: "u1",
      },
      {
        id: "ch1",
        source: "ego",
        target: "c1",
        type: "child",
        label: "u1",
      },
      {
        id: "ch2",
        source: "ego",
        target: "c2",
        type: "child",
        label: "u1",
      },
    ]);
    expect(segments.some((s) => s.kind === "spouse")).toBe(true);
    expect(segments.some((s) => s.kind === "union-stem")).toBe(true);
    expect(segments.filter((s) => s.kind === "union-branch").length).toBeGreaterThanOrEqual(2);
  });
});
