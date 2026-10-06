import {
  humanKinshipLabelFromSteps,
  KINSHIP_LABEL_FALLBACK,
} from "./humanKinshipLabel";

describe("humanKinshipLabelFromSteps", () => {
  it("labels direct family", () => {
    expect(
      humanKinshipLabelFromSteps(
        [{ relation: "child", toGender: "MALE" }],
        "en",
      ),
    ).toBe("Father");
    expect(
      humanKinshipLabelFromSteps(
        [{ relation: "parent", toGender: "FEMALE" }],
        "en",
      ),
    ).toBe("Daughter");
    expect(
      humanKinshipLabelFromSteps(
        [{ relation: "spouse", toGender: "FEMALE" }],
        "en",
      ),
    ).toBe("Wife");
  });

  it("labels grandparents, siblings, and aunts/uncles", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
      ], "en"),
    ).toBe("Grandfather");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
      ], "en"),
    ).toBe("Brother");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ], "en"),
    ).toBe("Paternal Uncle");
  });

  it("labels nieces, nephews, and cousins", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
      ], "en"),
    ).toBe("Niece");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ], "en"),
    ).toBe("Maternal First cousin");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
        { relation: "parent", toGender: "FEMALE" },
      ], "en"),
    ).toBe("Paternal Second cousin");
  });

  it("labels common in-laws", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "spouse", toGender: "MALE" },
        { relation: "child", toGender: "FEMALE" },
      ], "en"),
    ).toBe("Mother-in-law");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "parent", toGender: "MALE" },
        { relation: "spouse", toGender: "FEMALE" },
      ], "en"),
    ).toBe("Daughter-in-law");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "spouse", toGender: "FEMALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ], "en"),
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
      ], "en"),
    ).toBe("Paternal First cousin once removed");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
        { relation: "child", toGender: "FEMALE" },
      ], "en"),
    ).toBe("Great-grandmother");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ], "en"),
    ).toBe("Paternal Great-uncle");
  });

  it("returns null for paths with spouse hops in the middle", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "spouse", toGender: "FEMALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBeNull();
  });

  it("exposes a user-facing fallback constant", () => {
    expect(KINSHIP_LABEL_FALLBACK).toMatch(/Relative/);
  });

  it("defaults to South Asian (en-PK) labels", () => {
    expect(
      humanKinshipLabelFromSteps([{ relation: "child", toGender: "MALE" }]),
    ).toBe("Abbu");
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBe("Chacha");
  });
});
