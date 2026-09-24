import { calculateAge } from "@/lib/age";
import {
  buildHusbandFamilyReport,
  husbandSubjectForHouseholdReport,
} from "@/lib/household";
import { mockPerson, unionWithChildren } from "@/lib/testFixtures";

describe("reporting and age utilities", () => {
  describe("calculateAge", () => {
    it("returns null when birth date is missing", () => {
      expect(calculateAge(null)).toBeNull();
    });

    it("computes age at death for deceased persons", () => {
      const age = calculateAge("1945-03-12", "1998-05-05");
      expect(age).toBe(53);
    });

    it("handles leap-year birthdays before anniversary", () => {
      const age = calculateAge("2000-02-29", "2024-02-28");
      expect(age).toBe(23);
    });

    it("computes living age relative to reference end date", () => {
      const age = calculateAge("2000-01-01", "2020-06-01");
      expect(age).toBe(20);
    });
  });

  describe("buildHusbandFamilyReport", () => {
    const husband = mockPerson({
      id: "h",
      firstName: "Muhammad",
      lastName: "Khan",
      gender: "MALE",
    });
    const wife1 = mockPerson({
      id: "w1",
      firstName: "Fatima",
      lastName: "Khan",
      gender: "FEMALE",
      urduFirstName: "فاطمہ",
    });
    const wife2 = mockPerson({
      id: "w2",
      firstName: "Ayesha",
      lastName: "Khan",
      gender: "FEMALE",
    });
    const c1 = mockPerson({
      id: "c1",
      firstName: "Hassan",
      lastName: "Khan",
      gender: "MALE",
    });
    const c2 = mockPerson({
      id: "c2",
      firstName: "Zainab",
      lastName: "Khan",
      gender: "FEMALE",
    });
    const c3 = mockPerson({
      id: "c3",
      firstName: "Bilal",
      lastName: "Khan",
      gender: "MALE",
    });

    const raw1 = unionWithChildren("u1", husband, wife1, [
      { child: c1 },
      { child: c2 },
    ]);
    const raw2 = unionWithChildren("u2", husband, wife2, [{ child: c3 }]);
    const unions = [raw1, raw2].map((u, i) => ({
      id: u.id,
      partner1Id: u.partner1Id,
      partner2Id: u.partner2Id,
      partner1: u.partner1,
      partner2: u.partner2,
      marriageDate: i === 0 ? new Date("1970-06-15") : new Date("1980-01-20"),
      children: u.childships.map((c) => ({
        child: c.child,
        relationshipType: c.relationshipType,
      })),
    }));

    it("aggregates wife count and children per union", () => {
      const report = buildHusbandFamilyReport(husband, unions);
      expect(report).not.toBeNull();
      expect(report!.wifeCount).toBe(2);
      expect(report!.totalChildren).toBe(3);
      expect(report!.byWife[0].childrenCount).toBe(2);
      expect(report!.byWife[1].childrenCount).toBe(1);
      expect(report!.byWife[0].wifeName).toContain("Fatima");
    });

    it("returns null for non-male focal person", () => {
      const female = mockPerson({
        id: "f",
        firstName: "Fatima",
        lastName: "Khan",
        gender: "FEMALE",
      });
      expect(buildHusbandFamilyReport(female, unions)).toBeNull();
    });

    it("husbandSubjectForHouseholdReport resolves husband when focal is a wife", () => {
      const wife = wife1;
      const wifeUnions = unions.filter(
        (u) => u.partner1Id === wife.id || u.partner2Id === wife.id,
      );
      expect(husbandSubjectForHouseholdReport(wife, wifeUnions)?.id).toBe(
        husband.id,
      );
    });
  });
});
