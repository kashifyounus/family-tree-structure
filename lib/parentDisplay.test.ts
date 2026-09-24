import { parentNamesFromUnionPartners } from "@/lib/parentDisplay";

describe("parentNamesFromUnionPartners", () => {
  it("assigns father and mother by gender", () => {
    expect(
      parentNamesFromUnionPartners([
        { firstName: "Hassan", lastName: "Khan", gender: "MALE" },
        { firstName: "Ayesha", lastName: "Khan", gender: "FEMALE" },
      ]),
    ).toEqual({
      fatherName: "Hassan Khan",
      motherName: "Ayesha Khan",
    });
  });

  it("returns nulls when partners list is empty", () => {
    expect(parentNamesFromUnionPartners([])).toEqual({
      fatherName: null,
      motherName: null,
    });
  });
});
