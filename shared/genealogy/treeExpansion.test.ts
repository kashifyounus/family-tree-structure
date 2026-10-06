import {
  DEFAULT_TREE_EXPANSION,
  expandTreeToMaximum,
  maxReachableTreeExpansion,
  stepExpandTree,
  treeExpansionHasMore,
} from "./treeExpansion";

describe("treeExpansion", () => {
  const unions = [
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }, { childId: "uncle" }],
    },
    {
      id: "u-gp",
      partner1Id: "gpa",
      partner2Id: "gma",
      childships: [{ childId: "dad" }, { childId: "dadSib" }],
    },
    {
      id: "u-ego",
      partner1Id: "ego",
      partner2Id: "spouse",
      childships: [{ childId: "child" }],
    },
  ];

  it("defaults to two generations up and down", () => {
    expect(DEFAULT_TREE_EXPANSION.generationsUp).toBe(2);
    expect(DEFAULT_TREE_EXPANSION.generationsDown).toBe(2);
  });

  it("stepExpandTree grows all expansion axes", () => {
    const next = stepExpandTree(DEFAULT_TREE_EXPANSION);
    expect(next.generationsUp).toBe(3);
    expect(next.generationsDown).toBe(3);
    expect(next.siblingSteps).toBe(1);
    expect(next.cousinDegree).toBe(1);
  });

  it("maxReachableTreeExpansion fits the dataset", () => {
    const max = maxReachableTreeExpansion("ego", unions);
    expect(max.generationsUp).toBeGreaterThanOrEqual(3);
    expect(max.generationsDown).toBeGreaterThanOrEqual(2);
  });

  it("expandTreeToMaximum matches reachable cap", () => {
    expect(expandTreeToMaximum("ego", unions)).toEqual(
      maxReachableTreeExpansion("ego", unions),
    );
  });

  it("treeExpansionHasMore is true when collaterals remain hidden", () => {
    const included = new Set(["ego", "dad", "mom", "spouse", "child"]);
    expect(
      treeExpansionHasMore("ego", unions, DEFAULT_TREE_EXPANSION, included),
    ).toBe(true);
  });
});
