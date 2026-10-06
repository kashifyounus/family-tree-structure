import {
  collectIncludedPersonIds,
  layoutMarriageCentricGraph,
  sortByBirthOldestFirst,
} from "./marriageTreeLayout";

describe("marriageTreeLayout", () => {
  const unions = [
    {
      id: "u1",
      partner1Id: "ego",
      partner2Id: "spouse",
      childships: [{ childId: "c1" }, { childId: "c2" }],
    },
    {
      id: "u-parent",
      partner1Id: "dad",
      partner2Id: "mom",
      childships: [{ childId: "ego" }, { childId: "sib" }],
    },
  ];

  const people = new Map([
    { id: "ego", birthDate: "1980-01-01" },
    { id: "spouse", birthDate: "1982-01-01" },
    { id: "c1", birthDate: "2010-01-01" },
    { id: "c2", birthDate: "2005-01-01" },
    { id: "dad", birthDate: "1950-01-01" },
    { id: "mom", birthDate: "1952-01-01" },
    { id: "sib", birthDate: "1985-01-01" },
  ].map((p) => [p.id, p]));

  it("sorts children oldest first", () => {
    const sorted = sortByBirthOldestFirst([
      { id: "c1", birthDate: "2010-01-01" },
      { id: "c2", birthDate: "2005-01-01" },
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["c2", "c1"]);
  });

  it("includes siblings when siblingSteps > 0", () => {
    const included = collectIncludedPersonIds("ego", unions, 1, 1, 1);
    expect(included.has("sib")).toBe(true);
  });

  it("includes spouse parents when generationsUp >= 1", () => {
    const withSpouseParents = [
      ...unions,
      {
        id: "u-sp-inlaw",
        partner1Id: "fil",
        partner2Id: "mil",
        childships: [{ childId: "spouse" }],
      },
    ];
    const included = collectIncludedPersonIds(
      "ego",
      withSpouseParents,
      1,
      1,
      0,
    );
    expect(included.has("fil")).toBe(true);
    expect(included.has("mil")).toBe(true);
  });

  it("places spouse on marriage row and children below", () => {
    const included = collectIncludedPersonIds("ego", unions, 1, 1, 1);
    const { positions, edges, focalUnionId, focalUnionIds } =
      layoutMarriageCentricGraph("ego", people, unions, included);
    expect(positions.get("spouse")!.y).toBe(positions.get("ego")!.y);
    expect(positions.get("c2")!.y).toBeGreaterThan(positions.get("ego")!.y);
    expect(positions.get("sib")!.x).toBeLessThan(positions.get("ego")!.x);
    expect(edges.some((e) => e.type === "spouse")).toBe(true);
    expect(focalUnionId).toBe("u1");
    expect(focalUnionIds).toContain("u1");
    expect(edges.find((e) => e.type === "spouse")?.label).toBe("u1");
  });

  it("places husband siblings on the left wing when focal is the wife", () => {
    const spouseLineUnions = [
      ...unions,
      {
        id: "u-spouse-parents",
        partner1Id: "dad2",
        partner2Id: "mom2",
        childships: [{ childId: "spouse" }, { childId: "husbSib" }],
      },
    ];
    const genderedPeople = new Map(
      [
        { id: "ego", birthDate: "1982-01-01", gender: "FEMALE" },
        { id: "spouse", birthDate: "1980-01-01", gender: "MALE" },
        { id: "husbSib", birthDate: "1985-01-01", gender: "MALE" },
        { id: "c1", birthDate: "2010-01-01", gender: "MALE" },
        { id: "c2", birthDate: "2005-01-01", gender: "FEMALE" },
        { id: "dad", birthDate: "1950-01-01", gender: "MALE" },
        { id: "mom", birthDate: "1952-01-01", gender: "FEMALE" },
        { id: "dad2", birthDate: "1951-01-01", gender: "MALE" },
        { id: "mom2", birthDate: "1953-01-01", gender: "FEMALE" },
      ].map((p) => [p.id, p]),
    );

    const included = collectIncludedPersonIds("ego", spouseLineUnions, 2, 1, 1);
    included.add("husbSib");
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      genderedPeople,
      spouseLineUnions,
      included,
    );
    const husbandX = positions.get("spouse")!.x;
    const wifeX = positions.get("ego")!.x;
    const husbSibX = positions.get("husbSib")!.x;
    expect(husbandX).toBeLessThan(wifeX);
    expect(husbSibX).toBeLessThan(husbandX);
  });

  it("centers primary union children under the primary spouse (B1)", () => {
    const twoSpouseUnions = [
      {
        id: "u1",
        partner1Id: "ego",
        partner2Id: "spouse1",
        childships: [{ childId: "c1" }],
      },
      {
        id: "u2",
        partner1Id: "ego",
        partner2Id: "spouse2",
        childships: [{ childId: "c2" }],
      },
      {
        id: "u-parent",
        partner1Id: "dad",
        partner2Id: "mom",
        childships: [{ childId: "ego" }],
      },
    ];
    const included = collectIncludedPersonIds("ego", twoSpouseUnions, 1, 1, 0);
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      people,
      twoSpouseUnions,
      included,
    );
    const egoX = positions.get("ego")!.x;
    const s1X = positions.get("spouse1")!.x;
    const c1X = positions.get("c1")!.x;
    expect(positions.has("spouse2")).toBe(false);
    const mid1 = (Math.min(egoX, s1X) + Math.max(egoX, s1X) + 112) / 2;
    expect(Math.abs(c1X + 44 - mid1)).toBeLessThan(40);
  });

  it("can lay out every spouse column when onlyPrimarySpouseOnRow is false", () => {
    const twoSpouseUnions = [
      {
        id: "u1",
        partner1Id: "ego",
        partner2Id: "spouse1",
        childships: [{ childId: "c1" }],
      },
      {
        id: "u2",
        partner1Id: "ego",
        partner2Id: "spouse2",
        childships: [{ childId: "c2" }],
      },
      {
        id: "u-parent",
        partner1Id: "dad",
        partner2Id: "mom",
        childships: [{ childId: "ego" }],
      },
    ];
    const included = collectIncludedPersonIds("ego", twoSpouseUnions, 1, 1, 0);
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      people,
      twoSpouseUnions,
      included,
      0,
      0,
      { onlyPrimarySpouseOnRow: false },
    );
    const egoX = positions.get("ego")!.x;
    const s1X = positions.get("spouse1")!.x;
    const s2X = positions.get("spouse2")!.x;
    const c1X = positions.get("c1")!.x;
    const c2X = positions.get("c2")!.x;
    const mid1 = (Math.min(egoX, s1X) + Math.max(egoX, s1X) + 112) / 2;
    const mid2 = (Math.min(egoX, s2X) + Math.max(egoX, s2X) + 112) / 2;
    expect(Math.abs(c1X + 44 - mid1)).toBeLessThan(40);
    expect(Math.abs(c2X + 44 - mid2)).toBeLessThan(40);
    expect(Math.abs(c1X - c2X)).toBeGreaterThan(20);
  });

  it("includes spouse siblings when siblingSteps >= 1", () => {
    const withSpouseSib = [
      ...unions,
      {
        id: "u-sp-inlaw",
        partner1Id: "fil",
        partner2Id: "mil",
        childships: [{ childId: "spouse" }, { childId: "spouseSib" }],
      },
    ];
    const peopleWithInlaw = new Map([
      ...people,
      ["spouseSib", { id: "spouseSib", birthDate: "1984-01-01" }],
      ["fil", { id: "fil", birthDate: "1950-01-01" }],
      ["mil", { id: "mil", birthDate: "1952-01-01" }],
    ] as [string, { id: string; birthDate: string }][]);
    const zero = collectIncludedPersonIds("ego", withSpouseSib, 1, 1, 0);
    const one = collectIncludedPersonIds("ego", withSpouseSib, 1, 1, 1);
    expect(zero.has("spouseSib")).toBe(false);
    expect(one.has("spouseSib")).toBe(true);
    const laid = layoutMarriageCentricGraph(
      "ego",
      peopleWithInlaw,
      withSpouseSib,
      one,
    );
    expect(laid.positions.has("spouseSib")).toBe(true);
  });

  it("places wife siblings on the right wing when focal is the husband", () => {
    const husbandLineUnions = [
      ...unions,
      {
        id: "u-wife-parents",
        partner1Id: "dad3",
        partner2Id: "mom3",
        childships: [{ childId: "spouse" }, { childId: "wifeSib" }],
      },
    ];
    const genderedPeople = new Map(
      [
        { id: "ego", birthDate: "1980-01-01", gender: "MALE" },
        { id: "spouse", birthDate: "1982-01-01", gender: "FEMALE" },
        { id: "wifeSib", birthDate: "1985-01-01", gender: "FEMALE" },
        { id: "c1", birthDate: "2010-01-01", gender: "MALE" },
        { id: "c2", birthDate: "2005-01-01", gender: "FEMALE" },
        { id: "dad", birthDate: "1950-01-01", gender: "MALE" },
        { id: "mom", birthDate: "1952-01-01", gender: "FEMALE" },
        { id: "dad3", birthDate: "1951-01-01", gender: "MALE" },
        { id: "mom3", birthDate: "1953-01-01", gender: "FEMALE" },
      ].map((p) => [p.id, p]),
    );

    const included = collectIncludedPersonIds("ego", husbandLineUnions, 2, 1, 1);
    included.add("wifeSib");
    const { positions } = layoutMarriageCentricGraph(
      "ego",
      genderedPeople,
      husbandLineUnions,
      included,
    );
    const husbandX = positions.get("ego")!.x;
    const wifeX = positions.get("spouse")!.x;
    const wifeSibX = positions.get("wifeSib")!.x;
    expect(husbandX).toBeLessThan(wifeX);
    expect(wifeSibX).toBeGreaterThan(wifeX);
  });
});
