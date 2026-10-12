import { deoverlapPedigreeRowPositions } from "./pedigreeRowDeoverlap";

describe("pedigreeRowDeoverlap", () => {
  it("separates overlapping cards on the same row", () => {
    const included = new Set(["a", "b"]);
    const positions = new Map([
      ["a", { x: 0, y: 0 }],
      ["b", { x: 20, y: 0 }],
    ]);
    deoverlapPedigreeRowPositions(positions, included, 0);
    expect(positions.get("b")!.x).toBeGreaterThanOrEqual(112 + 22);
  });
});
