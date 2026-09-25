import {
  filterShowcaseMembers,
  showcaseMemberRows,
  SHOWCASE_MARGARET_ID,
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
