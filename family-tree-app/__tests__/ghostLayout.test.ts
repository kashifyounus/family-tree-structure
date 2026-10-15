import type { PedigreeCanvasNode } from "@/lib/graph/pedigreeCanvasPayload";
import { boxesOverlap, resolveGhostBoxPosition } from "@/lib/graph/ghostLayout";

function card(
  id: string,
  x: number,
  y: number,
  w = 88,
  h = 62,
): PedigreeCanvasNode {
  return {
    id,
    familyCode: "",
    label: id,
    nameLine1: id,
    nameLine2: "",
    initials: "X",
    years: "",
    gender: "OTHER",
    x,
    y,
    w,
    h,
    tier: "small",
    isFocal: false,
    isDeceased: false,
    isPrivate: false,
    hasUnexpandedParents: false,
    hasUnexpandedChildren: false,
    nickname: null,
    visualBand: "child",
    bandColor: "#000",
    roleLineEn: "",
    roleLineUr: "",
  };
}

describe("ghostLayout", () => {
  it("detects overlap", () => {
    expect(boxesOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(
      true,
    );
    expect(boxesOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 })).toBe(
      false,
    );
  });

  it("nudges sibling ghost away from neighbor card", () => {
    const obstacles = [card("neighbor", 0, 100)];
    const { x } = resolveGhostBoxPosition(-60, 100, 76, 44, obstacles, "siblings");
    const ghost = { x, y: 100, w: 76, h: 44 };
    expect(boxesOverlap(ghost, { x: 0, y: 100, w: 88, h: 62 })).toBe(false);
  });
});
