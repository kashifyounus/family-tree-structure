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

  it("labels cousins once removed and great-grandparents", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Paternal First cousin once removed");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
      ]),
    ).toBe("Great-grandmother");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Paternal Great-uncle");
  });

  it("labels marriage-bridge paths with a spouse hop", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "spouse", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Relative by marriage");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "parent", toGender: "FEMALE" },
        { relation: "spouse", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
      ]),
    ).toBe("Relative by marriage");
  });

  it("labels grand-niece and grand-nephew (up one, down three)", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Grand-nephew");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
      ]),
    ).toBe("Grand-niece");
  });

  it("exposes a user-facing fallback constant", () => {
    expect(KINSHIP_LABEL_FALLBACK).toMatch(/Relative/);
  });
});
