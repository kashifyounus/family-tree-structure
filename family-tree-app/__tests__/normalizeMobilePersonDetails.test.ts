import {
  normalizeMobilePersonDetails,
  type MobilePersonDetails,
} from "@/lib/api/mobilePersonDetails";

describe("normalizeMobilePersonDetails", () => {
  it("fills missing computed arrays and parentLinks", () => {
    const partial = {
      person: {
        id: "1",
        familyCode: "FAM-1",
        title: null,
        firstName: "A",
        lastName: "B",
        nickname: null,
        urduFirstName: null,
        urduLastName: null,
        gender: "MALE" as const,
        birthDate: null,
        deathDate: null,
        photoUrl: null,
        bio: null,
        isLiving: true,
        age: null,
        occupation: null,
        motherTongue: null,
        privacyLevel: "PUBLIC" as const,
        birthPlace: null,
        currentCity: null,
        permanentCity: null,
        homeTown: null,
      },
      unions: [],
    };

    const normalized = normalizeMobilePersonDetails(partial);
    expect(normalized.parentLinks).toEqual([]);
    expect(normalized.computed.fullSiblings).toEqual([]);
    expect(normalized.computed.paternalAunts).toEqual([]);
    expect(normalized.household).toBeNull();
  });
});
