import {
  canSelectAnchorForNewSpouse,
  canSelectChildAnchorForNewParent,
  canSelectParentAnchorForNewChild,
  canSelectSiblingAnchorForNewSibling,
} from "./addMemberLinkRules";
import { UNKNOWN_COPARENT_FAMILY_CODE } from "../unknownCoParent";
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

function singleFatherChild(): RuleGraph {
  return {
    people: [
      {
        id: "father",
        gender: "MALE",
        birthDate: null,
        deathDate: null,
        familyCode: "F",
      },
      {
        id: "son",
        gender: "MALE",
        birthDate: null,
        deathDate: null,
        familyCode: "S",
      },
      {
        id: "unk-f",
        gender: "FEMALE",
        birthDate: null,
        deathDate: null,
        familyCode: UNKNOWN_COPARENT_FAMILY_CODE.FEMALE,
      },
      {
        id: "unk-m",
        gender: "MALE",
        birthDate: null,
        deathDate: null,
        familyCode: UNKNOWN_COPARENT_FAMILY_CODE.MALE,
      },
    ],
    unions: [
      {
        id: "u",
        partner1Id: "father",
        partner2Id: "unk-f",
        marriageDate: null,
        divorceDate: null,
        childIds: ["son"],
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

  it("blocks parent role when child already has two real parents", () => {
    const g = family();
    expect(canSelectChildAnchorForNewParent(g, "son", "MALE")).toBe(false);
    expect(canSelectChildAnchorForNewParent(g, "son", "FEMALE")).toBe(false);
  });

  it("allows parent role when only father is known (unknown co-parent slot)", () => {
    const g = singleFatherChild();
    expect(canSelectChildAnchorForNewParent(g, "son", "FEMALE")).toBe(true);
    expect(canSelectChildAnchorForNewParent(g, "son", "MALE")).toBe(false);
  });

  it("allows child role when parent can accept another child", () => {
    const g = family();
    expect(canSelectParentAnchorForNewChild(g, "son", "MALE")).toBe(true);
    expect(canSelectParentAnchorForNewChild(g, "father", "MALE")).toBe(true);
  });

  it("allows sibling anchor when parents are known and graph rules pass", () => {
    const g = family();
    expect(canSelectSiblingAnchorForNewSibling(g, "son", "MALE")).toBe(true);
    expect(canSelectSiblingAnchorForNewSibling(g, "father", "MALE")).toBe(false);
  });
});
