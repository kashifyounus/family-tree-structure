import {
  editFieldsFromMember,
  emptyMemberProfileEditFields,
} from "@/lib/members/memberProfileEditForm";

describe("memberProfileEditForm", () => {
  it("maps member record into edit fields", () => {
    const fields = editFieldsFromMember({
      id: "p1",
      familyCode: "FAM-1",
      firstName: "Ali",
      lastName: "Khan",
      nickname: null,
      urduFirstName: null,
      urduLastName: null,
      gender: "MALE",
      birthDate: "1990-02-01",
      deathDate: null,
      currentCity: "Karachi, Sindh",
      birthPlace: "Lahore, Punjab",
      homeTown: "Lahore, Punjab",
      occupation: "Engineer",
      bio: "Notes",
    });
    expect(fields.firstName).toBe("Ali");
    expect(fields.livingCity).toBe("Karachi");
    expect(fields.livingProvince).toBe("Sindh");
    expect(fields.bio).toBe("Notes");
  });

  it("starts from empty defaults", () => {
    expect(emptyMemberProfileEditFields.firstName).toBe("");
  });
});
