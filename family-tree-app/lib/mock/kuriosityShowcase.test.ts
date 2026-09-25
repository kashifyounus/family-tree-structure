import {
  filterShowcaseMembers,
  showcaseMemberRows,
  SHOWCASE_MARGARET_ID,
  shouldShowShowcasePedigree,
} from "./kuriosityShowcase";

describe("filterShowcaseMembers", () => {
  it("filters living members", () => {
    const living = filterShowcaseMembers(showcaseMemberRows, "", "living");
    expect(living.every((r) => r.living)).toBe(true);
    expect(living.find((r) => r.id === SHOWCASE_MARGARET_ID)).toBeDefined();
  });

  it("matches search by name", () => {
    const results = filterShowcaseMembers(showcaseMemberRows, "margaret", "all");
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Margaret Khan");
  });
});

describe("shouldShowShowcasePedigree", () => {
  it("shows only for empty local archive", () => {
    expect(shouldShowShowcasePedigree(0, "local")).toBe(true);
    expect(shouldShowShowcasePedigree(3, "local")).toBe(false);
    expect(shouldShowShowcasePedigree(0, "online")).toBe(false);
  });
});
