import {
  canSelectAnchorForNewSpouse,
  canSelectChildAnchorForNewParent,
  canSelectParentAnchorForNewChild,
} from "./addMemberLinkRules";
import type { RuleGraph } from "../relationshipRules";

function family(): RuleGraph {
  return {
    people: [
      { id: "father", gender: "MALE", birthDate: "1950-01-01", deathDate: null },
      { id: "mother", gender: "FEMALE", birthDate: "1952-01-01", deathDate: null },
      { id: "son", gender: "MALE", birthDate: "1980-01-01", deathDate: null },
      { id: "daughter", gender: "FEMALE", birthDate: "1982-01-01", deathDate: null },
      { id: "wife", gender: "FEMALE", birthDate: "1981-05-01", deathDate: null },
    ],
    unions: [
      {
        id: "parents",
        partner1Id: "father",
        partner2Id: "mother",
        marriageDate: null,
        divorceDate: null,
        childIds: ["son", "daughter"],
      },
      {
        id: "son-marriage",
        partner1Id: "son",
        partner2Id: "wife",
        marriageDate: null,
        divorceDate: null,
        childIds: [],
      },
    ],
  };
}

describe("addMemberLinkRules", () => {
  it("allows spouse anchor when shared marriage rules pass", () => {
    const g = family();
    expect(canSelectAnchorForNewSpouse(g, "wife", "FEMALE")).toBe(true);
    expect(canSelectAnchorForNewSpouse(g, "daughter", "MALE")).toBe(true);
  });

  it("blocks parent role when child already has two parents", () => {
    const g = family();
    expect(canSelectChildAnchorForNewParent(g, "son", "MALE")).toBe(false);
  });

  it("allows child role when parent can accept another child", () => {
    const g = family();
    expect(canSelectParentAnchorForNewChild(g, "son")).toBe(true);
    expect(canSelectParentAnchorForNewChild(g, "father")).toBe(true);
  });
});
