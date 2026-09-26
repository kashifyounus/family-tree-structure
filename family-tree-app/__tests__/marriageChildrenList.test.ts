import type { MobilePersonSummary } from "@/lib/api/mobilePersonDetails";
import { normalizeMobilePersonDetails } from "@/lib/api/mobilePersonDetails";
import { mapOnlineDetailsToBundle } from "@/lib/data/onlinePersonMapper";

function person(
  id: string,
  code: string,
  first: string,
  last: string,
  extras?: Partial<MobilePersonSummary>,
): MobilePersonSummary {
  return {
    id,
    familyCode: code,
    title: null,
    firstName: first,
    lastName: last,
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: "MALE",
    birthDate: null,
    deathDate: null,
    photoUrl: null,
    bio: null,
    isLiving: true,
    age: null,
    occupation: null,
    motherTongue: null,
    privacyLevel: "MEMBERS_ONLY",
    birthPlace: null,
    currentCity: null,
    permanentCity: null,
    homeTown: null,
    ...extras,
  };
}

describe("marriage children profile data", () => {
  it("maps union children without exposing family codes in display fields", () => {
    const focal = person("p1", "FAM-1", "Parent", "Khan");
    const child = {
      ...person("c1", "FAM-CHILD", "Sara", "Khan", {
        birthDate: "2010-05-01",
        deathDate: null,
      }),
      relationshipType: "BIOLOGICAL" as const,
      unionId: "u1",
    };
    const spouse = person("p2", "FAM-2", "Spouse", "Khan", { gender: "FEMALE" });
    const details = normalizeMobilePersonDetails({
      person: focal,
      parentLinks: [],
      unions: [
        {
          id: "u1",
          partner1: focal,
          partner2: spouse,
          marriageDate: "2005-01-01",
          divorceDate: null,
          isActive: true,
          children: [child],
        },
      ],
      computed: {
        fullSiblings: [],
        halfSiblings: [],
        paternalUncles: [],
        paternalAunts: [],
        maternalUncles: [],
        maternalAunts: [],
      },
      household: null,
    });
    const bundle = mapOnlineDetailsToBundle(details);
    const mapped = bundle.unions[0]?.children[0];
    expect(mapped?.name).toBe("Sara Khan");
    expect(mapped?.familyCode).toBe("FAM-CHILD");
    expect(mapped?.birthDate).toBe("2010-05-01");
    expect(mapped?.name).not.toContain("FAM-");
  });
});
