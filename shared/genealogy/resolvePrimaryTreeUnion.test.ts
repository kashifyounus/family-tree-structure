import { resolvePrimaryTreeUnionId } from "./resolvePrimaryTreeUnion";

describe("resolvePrimaryTreeUnionId", () => {
  it("returns stored id when it belongs to the person", () => {
    expect(resolvePrimaryTreeUnionId("u2", ["u1", "u2"])).toBe("u2");
  });

  it("returns null when preference is missing or stale", () => {
    expect(resolvePrimaryTreeUnionId(null, ["u1"])).toBeNull();
    expect(resolvePrimaryTreeUnionId("u9", ["u1"])).toBeNull();
  });
});
