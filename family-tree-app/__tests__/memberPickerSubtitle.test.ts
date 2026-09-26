import {
  memberPickerSubtitle,
  memberRecordSubtitle,
} from "@/lib/members/memberPickerSubtitle";

describe("memberPickerSubtitle", () => {
  it("never includes family codes", () => {
    const line = memberPickerSubtitle({
      id: "1",
      name: "Ali Khan",
      familyCode: "FAM-99999",
      birthDate: "1990-01-02",
      currentCity: "Karachi",
    });
    expect(line).not.toMatch(/FAM-/);
    expect(line).toContain("Karachi");
  });
});

describe("memberRecordSubtitle", () => {
  it("formats member rows without codes", () => {
    const line = memberRecordSubtitle({
      birthDate: null,
      currentCity: "Lahore",
      gender: "MALE",
    });
    expect(line).toBe("Lahore");
    expect(line).not.toMatch(/FAM-/);
  });
});
