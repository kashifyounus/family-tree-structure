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

  it("returns null for cousin-length paths", () => {
    expect(
      humanKinshipLabelFromSteps([
        { relation: "child", toGender: "MALE" },
        { relation: "child", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
        { relation: "parent", toGender: "MALE" },
      ]),
    ).toBeNull();
  });

  it("exposes a user-facing fallback constant", () => {
    expect(KINSHIP_LABEL_FALLBACK).toMatch(/Relative/);
  });
});
