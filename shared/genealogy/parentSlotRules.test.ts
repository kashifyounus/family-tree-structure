import { UNKNOWN_COPARENT_FAMILY_CODE } from "../unknownCoParent";
import {
  openParentSlotForGender,
  parentPairAfterNewParent,
  realParentRoles,
} from "./parentSlotRules";
import type { RuleGraph } from "../relationshipRules";

function graphWithUnknownCoParents(): RuleGraph {
  return {
    people: [
      {
        id: "dad",
        gender: "MALE",
        birthDate: null,
        deathDate: null,
        familyCode: "DAD",
      },
      {
        id: "son",
        gender: "MALE",
        birthDate: null,
        deathDate: null,
        familyCode: "SON",
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
        id: "u1",
        partner1Id: "dad",
        partner2Id: "unk-f",
        marriageDate: null,
        divorceDate: null,
        childIds: ["son"],
      },
    ],
  };
}

describe("parentSlotRules", () => {
  it("treats unknown co-parent as open opposite slot", () => {
    const g = graphWithUnknownCoParents();
    expect(realParentRoles(g, "son")).toEqual({
      fatherId: "dad",
      motherId: null,
    });
    expect(openParentSlotForGender(g, "son", "FEMALE")).toBe(true);
    expect(openParentSlotForGender(g, "son", "MALE")).toBe(false);
  });

  it("builds pair when adding mother to single-father child", () => {
    const g = graphWithUnknownCoParents();
    expect(
      parentPairAfterNewParent(g, "son", "new-mom", "FEMALE"),
    ).toEqual({ parentAId: "dad", parentBId: "new-mom" });
  });
});
