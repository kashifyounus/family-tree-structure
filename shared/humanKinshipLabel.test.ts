import {
  humanKinshipLabelFromSteps,
  KINSHIP_LABEL_FALLBACK,
} from "./humanKinshipLabel";

describe("humanKinshipLabelFromSteps", () => {
  it("labels direct family", () => {
    expect(
      humanKinshipLabelFromSteps([{ relation: "child", toGender: "MALE" }]),
    ).toBe("Father");
    expect(
      humanKinshipLabelFromSteps([{ relation: "parent", toGender: "FEMALE" }]),
    ).toBe("Daughter");
    expect(
      humanKinshipLabelFromSteps([{ relation: "spouse", toGender: "FEMALE" }]),
    ).toBe("Wife");
  });

  it("labels grandparents, siblings, and aunts/uncles", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
      ]),
    ).toBe("Grandfather");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Brother");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Paternal Uncle");
  });

  it("labels nieces, nephews, and cousins", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
      ]),
    ).toBe("Niece");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Maternal First cousin");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
      ]),
    ).toBe("Paternal Second cousin");
  });

  it("labels common in-laws", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "spouse", toGender: "MALE" },
        { relation: "child", toGender: "FEMALE" },
      ]),
    ).toBe("Mother-in-law");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "parent", toGender: "MALE" },
        { relation: "spouse", toGender: "FEMALE" },
      ]),
    ).toBe("Daughter-in-law");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "spouse", toGender: "FEMALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Brother-in-law");
  });

  it("returns null for distant or asymmetric paths", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBeNull();
  });

  it("exposes a user-facing fallback constant", () => {
    expect(KINSHIP_LABEL_FALLBACK).toMatch(/Relative/);
  });
});
