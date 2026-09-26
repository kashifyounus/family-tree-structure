import { pairParentsWithUnknownCoParent } from "../../shared/unknownCoParent";

describe("single-parent parent assignment", () => {
  it("builds a union pair when only the father is known", () => {
    expect(
      pairParentsWithUnknownCoParent({
        fatherId: "dad",
        motherId: null,
        unknownMaleId: "unk-m",
        unknownFemaleId: "unk-f",
      }),
    ).toEqual({ parentAId: "dad", parentBId: "unk-f" });
  });

  it("builds a union pair when only the mother is known", () => {
    expect(
      pairParentsWithUnknownCoParent({
        fatherId: null,
        motherId: "mom",
        unknownMaleId: "unk-m",
        unknownFemaleId: "unk-f",
      }),
    ).toEqual({ parentAId: "unk-m", parentBId: "mom" });
  });
});
