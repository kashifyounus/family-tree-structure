import { includeCousinsUpToDegree } from "./cousinInclusion";
import type { MarriageLayoutUnion } from "../marriageTreeLayout";

describe("cousinInclusion", () => {
  const unions: MarriageLayoutUnion[] = [
    {
      id: "u-gp",
      partner1Id: "gpa",
      partner2Id: "gma",
      childships: [{ childId: "dad" }, { childId: "uncle" }],
    },
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }, { childId: "sib" }],
    },
    {
      id: "u-uncle",
      partner1Id: "uncle",
      partner2Id: "aunt",
      childships: [{ childId: "cousin1" }],
    },
    {
      id: "u-gp2",
      partner1Id: "gpa2",
      partner2Id: "gma2",
      childships: [{ childId: "gpa" }, { childId: "gpaSib" }],
    },
    {
      id: "u-gpaSib-line",
      partner1Id: "gpaSib",
      partner2Id: "gpaSibSp",
      childships: [{ childId: "dadCousin" }],
    },
    {
      id: "u-dadCousin-child",
      partner1Id: "dadCousin",
      partner2Id: "dadCousinSp",
      childships: [{ childId: "cousin2" }],
    },
  ];

  it("includes 1st cousins when degree >= 1", () => {
    const included = new Set(["ego", "dad", "mom"]);
    includeCousinsUpToDegree("ego", unions, included, 1);
    expect(included.has("cousin1")).toBe(true);
    expect(included.has("uncle")).toBe(true);
  });

  it("includes 2nd cousins when degree >= 2", () => {
    const included = new Set(["ego", "dad", "mom", "gpa", "gma"]);
    includeCousinsUpToDegree("ego", unions, included, 2);
    expect(included.has("cousin2")).toBe(true);
    expect(included.has("gpaSib")).toBe(true);
  });
});
