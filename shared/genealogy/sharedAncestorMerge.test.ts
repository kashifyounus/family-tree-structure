import { reconcileSharedAncestors } from "./sharedAncestorMerge";

describe("sharedAncestorMerge", () => {
  it("centers a common grandparent above the marriage row", () => {
    const unions = [
      {
        id: "u1",
        partner1Id: "ego",
        partner2Id: "spouse",
        childships: [],
      },
      {
        id: "u2",
        partner1Id: "dad",
        partner2Id: "dadWife",
        childships: [{ childId: "ego" }],
      },
      {
        id: "u3",
        partner1Id: "mom",
        partner2Id: "momHusband",
        childships: [{ childId: "spouse" }],
      },
      {
        id: "u4",
        partner1Id: "sharedGp",
        partner2Id: "otherGp",
        childships: [{ childId: "dad" }, { childId: "mom" }],
      },
    ];
    const included = new Set([
      "ego",
      "spouse",
      "dad",
      "mom",
      "sharedGp",
      "otherGp",
    ]);
    const positions = new Map<string, { x: number; y: number }>([
      ["ego", { x: 0, y: 200 }],
      ["spouse", { x: 120, y: 200 }],
      ["dad", { x: -80, y: 120 }],
      ["mom", { x: 200, y: 120 }],
      ["sharedGp", { x: -200, y: 40 }],
      ["otherGp", { x: 300, y: 40 }],
    ]);

    const merged = reconcileSharedAncestors(
      positions,
      "ego",
      "spouse",
      unions,
      included,
      200,
    );

    expect(merged).toContain("sharedGp");
    const gp = positions.get("sharedGp");
    expect(gp?.x).toBeGreaterThan(-50);
    expect(gp?.x).toBeLessThan(100);
    expect(gp?.y).toBeLessThan(120);
  });
});
