import type { AddChildInput } from "@/lib/data/types";

/** Compile-time contract: child create flows may pass optional birthDate. */
describe("AddChildInput", () => {
  it("accepts optional birthDate on create", () => {
    const input: AddChildInput = {
      parentPersonId: "p1",
      firstName: "Ali",
      lastName: "Khan",
      gender: "MALE",
      birthDate: "2015-06-01",
    };
    expect(input.birthDate).toBe("2015-06-01");
  });
});
