import {
  UNKNOWN_COPARENT_FAMILY_CODE,
  formatPersonDisplayName,
  isUnknownCoParentFamilyCode,
  pairParentsWithUnknownCoParent,
} from "./unknownCoParent";

describe("unknown co-parent helpers", () => {
  it("detects sentinel family codes", () => {
    expect(isUnknownCoParentFamilyCode(UNKNOWN_COPARENT_FAMILY_CODE.MALE)).toBe(true);
    expect(isUnknownCoParentFamilyCode("FAM-001")).toBe(false);
  });

  it("formats unknown co-parent without family codes", () => {
    expect(
      formatPersonDisplayName({
        firstName: "Unknown",
        lastName: "Parent",
        familyCode: UNKNOWN_COPARENT_FAMILY_CODE.FEMALE,
      }),
    ).toBe("Unknown");
  });

  it("pairs a single known parent with the correct unknown co-parent id", () => {
    expect(
      pairParentsWithUnknownCoParent({
        fatherId: "dad",
        motherId: null,
        unknownMaleId: "unk-m",
        unknownFemaleId: "unk-f",
      }),
    ).toEqual({ parentAId: "dad", parentBId: "unk-f" });
    expect(
      pairParentsWithUnknownCoParent({
        fatherId: null,
        motherId: "mom",
        unknownMaleId: "unk-m",
        unknownFemaleId: "unk-f",
      }),
    ).toEqual({ parentAId: "unk-m", parentBId: "mom" });
    expect(
      pairParentsWithUnknownCoParent({
        fatherId: "dad",
        motherId: "mom",
        unknownMaleId: "unk-m",
        unknownFemaleId: "unk-f",
      }),
    ).toEqual({ parentAId: "dad", parentBId: "mom" });
  });
});
