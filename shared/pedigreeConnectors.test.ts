import { buildPedigreeConnectorSegments } from "./pedigreeConnectors";
import { PEDIGREE_CARD_H, PEDIGREE_CARD_W } from "./pedigreeLayoutTokens";

const W = PEDIGREE_CARD_W;
const H = PEDIGREE_CARD_H;

function isOrthogonal(s: { x1: number; y1: number; x2: number; y2: number }) {
  return s.x1 === s.x2 || s.y1 === s.y2;
}

describe("pedigreeConnectors v4", () => {
  const coupleNodes = [
    { id: "ego", x: 0, y: 100, width: W, height: H },
    { id: "spouse", x: W + 28, y: 100, width: W, height: H },
    { id: "c1", x: 40, y: 100 + H + 72, width: W, height: H },
    { id: "c2", x: 200, y: 100 + H + 72, width: W, height: H },
  ];

  it("draws spouse bar on side mids (horizontal)", () => {
    const segments = buildPedigreeConnectorSegments(coupleNodes, [
      { id: "s1", source: "ego", target: "spouse", type: "spouse", label: "u1" },
    ]);
    const spouse = segments.find((s) => s.kind === "spouse");
    expect(spouse).toBeDefined();
    expect(spouse!.y1).toBe(spouse!.y2);
    expect(spouse!.x1).toBe(W);
    expect(spouse!.x2).toBe(W + 28);
  });

  it("draws orthogonal parent→child with L-jog when misaligned", () => {
    const nodes = [
      { id: "dad", x: 0, y: 0, width: W, height: H },
      { id: "ego", x: 120, y: H + 72, width: W, height: H },
    ];
    const segments = buildPedigreeConnectorSegments(nodes, [
      { id: "p1", source: "dad", target: "ego", type: "parent" },
    ]);
    expect(segments.every(isOrthogonal)).toBe(true);
    expect(segments.some((s) => s.kind === "parent" && s.y1 === s.y2)).toBe(true);
    const horiz = segments.find((s) => s.y1 === s.y2)!;
    expect(Math.abs(horiz.x2 - horiz.x1)).toBeGreaterThanOrEqual(16);
  });

  it("draws couple stem, rail, and drops for multiple children", () => {
    const segments = buildPedigreeConnectorSegments(coupleNodes, [
      { id: "s1", source: "ego", target: "spouse", type: "spouse", label: "u1" },
      { id: "ch1", source: "ego", target: "c1", type: "child", label: "u1" },
      { id: "ch2", source: "ego", target: "c2", type: "child", label: "u1" },
    ]);
    expect(segments.every(isOrthogonal)).toBe(true);
    expect(segments.some((s) => s.kind === "union-stem")).toBe(true);
    expect(segments.filter((s) => s.kind === "union-branch").length).toBeGreaterThanOrEqual(3);
  });

  it("draws single-child stem to top-center", () => {
    const nodes = [
      { id: "ego", x: 0, y: 0, width: W, height: H },
      { id: "spouse", x: W + 28, y: 0, width: W, height: H },
      {
        id: "only",
        x: (W + 28 + W) / 2 - W / 2,
        y: H + 72,
        width: W,
        height: H,
      },
    ];
    const segments = buildPedigreeConnectorSegments(nodes, [
      { id: "s1", source: "ego", target: "spouse", type: "spouse", label: "u1" },
      { id: "ch1", source: "ego", target: "only", type: "child", label: "u1" },
    ]);
    const drop = segments.find((s) => s.id.includes("union-drop"));
    expect(drop).toBeDefined();
    expect(drop!.x1).toBe(drop!.x2);
    expect(drop!.y2).toBe(nodes[2].y);
  });
});
