import {
  generationsToIncludeKinshipPath,
  shortestUpDownBetween,
  treeExpansionForKinshipPath,
} from "./kinshipPathFraming";

const unions = [
  {
    id: "u1",
    partner1Id: "gp1",
    partner2Id: "gp2",
    childships: [{ childId: "p1" }],
  },
  {
    id: "u2",
    partner1Id: "p1",
    partner2Id: "p2",
    childships: [{ childId: "c1" }, { childId: "c2" }],
  },
];

describe("kinshipPathFraming", () => {
  it("measures up/down between parent and child", () => {
    expect(shortestUpDownBetween("p1", "c1", unions)).toEqual({ up: 0, down: 1 });
    expect(shortestUpDownBetween("c1", "p1", unions)).toEqual({ up: 1, down: 0 });
  });

  it("measures cousin distance as up and down", () => {
    expect(shortestUpDownBetween("c1", "c2", unions)).toEqual({ up: 1, down: 1 });
  });

  it("requests enough generations to include everyone on a path", () => {
    const gens = generationsToIncludeKinshipPath("c1", ["c1", "gp1", "c2"], unions);
    expect(gens.generationsUp).toBeGreaterThanOrEqual(2);
    expect(gens.generationsDown).toBeGreaterThanOrEqual(2);
  });

  it("raises sibling steps when the path needs a collateral on the tree", () => {
    const exp = treeExpansionForKinshipPath("c1", ["c1", "c2"], unions);
    expect(exp.siblingSteps).toBeGreaterThanOrEqual(1);
  });
});
