import {
  generationOffsetFromFocal,
  resolvePedigreeVisualBand,
} from "./pedigreeNodePresentation";

describe("pedigreeNodePresentation", () => {
  const edges = [
    { source: "dad", target: "ego", type: "parent" },
    { source: "mom", target: "ego", type: "parent" },
    { source: "gpa", target: "dad", type: "parent" },
    { source: "ego", target: "kid", type: "child" },
  ];

  it("measures ancestor depth", () => {
    expect(generationOffsetFromFocal("ego", "dad", edges)).toBe(-1);
    expect(generationOffsetFromFocal("ego", "gpa", edges)).toBe(-2);
    expect(generationOffsetFromFocal("ego", "kid", edges)).toBe(1);
  });

  it("assigns ggp band for deep ancestors", () => {
    expect(
      resolvePedigreeVisualBand({
        focalId: "ego",
        personId: "ggp",
        isSpouse: false,
        isMaternalWing: false,
        generationOffset: -3,
      }),
    ).toBe("ggp");
  });
});
