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
      gender: "MALE",
      birthDate: "1990-02-01",
      deathDate: null,
      currentCity: "Karachi",
      birthPlace: "Lahore",
      homeTown: "Lahore",
      occupation: "Engineer",
      bio: "Notes",
      isLiving: true,
    });
    expect(fields.firstName).toBe("Ali");
    expect(fields.city).toBe("Karachi");
    expect(fields.bio).toBe("Notes");
  });

  it("starts from empty defaults", () => {
    expect(emptyMemberProfileEditFields.firstName).toBe("");
  });
});
