import { applyCousinNetworkPosterSpread } from "./cousinNetworkPosterLayout";

describe("cousinNetworkPosterLayout", () => {
  it("spreads maternal wing nodes to the right of center", () => {
    const positions = new Map<string, { x: number; y: number }>([
      ["ego", { x: 0, y: 200 }],
      ["spouse", { x: 120, y: 200 }],
      ["inlaws", { x: 280, y: 80 }],
    ]);
    const included = new Set(["ego", "spouse", "inlaws"]);
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
        partner2Id: "mom",
        childships: [{ childId: "spouse" }],
      },
      {
        id: "u3",
        partner1Id: "inlaws",
        partner2Id: "other",
        childships: [{ childId: "mom" }],
      },
    ];
    included.add("mom");
    applyCousinNetworkPosterSpread(
      positions,
      "ego",
      ["spouse"],
      unions,
      included,
      200,
    );
    const before = 280;
    const after = positions.get("inlaws")?.x ?? 0;
    expect(after).toBeGreaterThan(before);
  });
});
