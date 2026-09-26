import {
  ancestorIds,
  assertCanAssignParents,
  assertCanAttachChild,
  assertCanCreateMarriage,
  assertLifeDates,
  assertMarriageTimeline,
  canonicalPartnerIds,
  defaultSpouseGender,
  descendantIds,
  findMarriage,
  RelationshipRuleError,
  type RuleGraph,
} from "./relationshipRules";

function graph(): RuleGraph {
  return {
    people: [
      { id: "father", gender: "MALE", birthDate: "1950-01-01", deathDate: null },
      { id: "mother", gender: "FEMALE", birthDate: "1952-01-01", deathDate: null },
      { id: "son", gender: "MALE", birthDate: "1980-01-01", deathDate: null },
      { id: "daughter", gender: "FEMALE", birthDate: "1982-01-01", deathDate: null },
      { id: "wife", gender: "FEMALE", birthDate: "1981-05-01", deathDate: null },
      { id: "grandson", gender: "MALE", birthDate: "2010-01-01", deathDate: null },
    ],
    unions: [
      {
        id: "parents",
        partner1Id: "father",
        partner2Id: "mother",
        marriageDate: "1975-06-01",
        divorceDate: null,
        childIds: ["son", "daughter"],
      },
      {
        id: "son-marriage",
        partner1Id: "son",
        partner2Id: "wife",
        marriageDate: "2005-04-01",
        divorceDate: null,
        childIds: ["grandson"],
      },
    ],
  };
}

describe("relationship rules", () => {
  it("defaults spouse gender from a binary gender and leaves Other unset", () => {
    expect(defaultSpouseGender("MALE")).toBe("FEMALE");
    expect(defaultSpouseGender("FEMALE")).toBe("MALE");
    expect(defaultSpouseGender("OTHER")).toBeNull();
  });

  it("treats partner order as the same marriage", () => {
    expect(canonicalPartnerIds("b", "a")).toEqual(["a", "b"]);
    expect(findMarriage(graph(), "mother", "father")?.id).toBe("parents");
  });

  it("rejects a duplicate marriage, a self marriage, and marrying a descendant", () => {
    const family = graph();
    expect(() => assertCanCreateMarriage(family, "father", "mother")).toThrow(
      RelationshipRuleError,
    );
    expect(() => assertCanCreateMarriage(family, "son", "son")).toThrow(
      /own spouse/,
    );
    expect(() => assertCanCreateMarriage(family, "father", "son")).toThrow(
      /ancestor/,
    );
    expect(ancestorIds(family, "grandson").has("father")).toBe(true);
    expect(descendantIds(family, "father").has("grandson")).toBe(true);
  });

  it("allows a second marriage for the same person", () => {
    expect(() =>
      assertCanCreateMarriage(graph(), "son", "daughter", "2012-01-01"),
    ).not.toThrow();
  });

  it("rejects marriage and life dates that are out of order", () => {
    expect(() => assertLifeDates("2000-01-01", "1990-01-01")).toThrow(
      /date of death/i,
    );
    expect(() =>
      assertMarriageTimeline({
        marriageDate: "1970-01-01",
        divorceDate: "1960-01-01",
      }),
    ).toThrow(/divorce date/i);
    expect(() =>
      assertCanCreateMarriage(graph(), "daughter", "wife", "1970-01-01"),
    ).toThrow(/date of birth/i);
  });

  it("rejects a child who is already in the marriage or is one of the spouses", () => {
    const family = graph();
    expect(() => assertCanAttachChild(family, "parents", "son")).toThrow(
      /already recorded as a child/,
    );
    expect(() => assertCanAttachChild(family, "parents", "father")).toThrow(
      /both a spouse and a child/,
    );
  });

  it("allows assigning one known parent with an unknown co-parent sentinel", () => {
    const family: RuleGraph = {
      people: [
        { id: "child", gender: "MALE", birthDate: null, deathDate: null },
        { id: "dad", gender: "MALE", birthDate: null, deathDate: null },
        { id: "unk-mom", gender: "FEMALE", birthDate: null, deathDate: null },
      ],
      unions: [],
    };
    expect(() =>
      assertCanAssignParents(family, "child", "dad", "unk-mom"),
    ).not.toThrow();
  });

  it("rejects a spouse or descendant as a parent and accepts two new parents", () => {
    const family = graph();
    expect(() => assertCanAssignParents(family, "son", "wife", "mother")).toThrow(
      /spouse cannot also be recorded/,
    );
    expect(() =>
      assertCanAssignParents(family, "father", "son", "daughter"),
    ).toThrow(/descendant/);
    expect(() => assertCanAssignParents(family, "son", "son", "mother")).toThrow(
      /own parent/,
    );
    expect(() =>
      assertCanAssignParents(family, "wife", "father", "mother"),
    ).not.toThrow();
  });
});
