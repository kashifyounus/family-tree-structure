import { buildMutualRelationshipOutcome } from "../../shared/genealogy/mutualRelationship";

describe("mutualRelationship business rules", () => {
  it("buildMutualRelationshipOutcome lists link steps on shortest path", () => {
    const outcome = buildMutualRelationshipOutcome({
      personAId: "a",
      personBId: "b",
      labelFromAToB: "Son",
      labelFromBToA: "Father",
      shortestPathFromAToB: [
        { fromId: "a", toId: "mid", relation: "parent" },
        { fromId: "mid", toId: "b", relation: "parent" },
      ],
    });
    expect(outcome.howPersonARelatesToB).toBe("Son");
    expect(outcome.howPersonBRelatesToA).toBe("Father");
    expect(outcome.mutualLinks).toHaveLength(2);
    expect(outcome.mutualLinks[0].linkPhrase).toBe("is parent of");
  });
});
