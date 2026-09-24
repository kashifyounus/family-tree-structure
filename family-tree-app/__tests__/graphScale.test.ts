import { clampGraphScale } from "@/lib/graph/graphScale";

describe("clampGraphScale", () => {
  it("clamps zoom within safe bounds", () => {
    expect(clampGraphScale(0.1)).toBe(0.55);
    expect(clampGraphScale(1)).toBe(1);
    expect(clampGraphScale(9)).toBe(2.5);
  });
});
