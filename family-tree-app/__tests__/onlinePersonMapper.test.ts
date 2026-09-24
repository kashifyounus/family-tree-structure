import type { MobilePersonSummary } from "@/lib/api/mobilePersonDetails";
import { normalizeMobilePersonDetails } from "@/lib/api/mobilePersonDetails";
import {
  computedRelationsFromMobile,
  mapOnlineDetailsToBundle,
  parentsFromParentLinks,
} from "@/lib/data/onlinePersonMapper";

function person(
  id: string,
  code: string,
  first: string,
  last: string,
  gender: "MALE" | "FEMALE" = "MALE",
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
    gender,
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
  };
}

describe("onlinePersonMapper", () => {
  it("maps parent links to unique kinship parents", () => {
    const father = person("p1", "FAM-1", "Hassan", "Khan", "MALE");
    const mother = person("p2", "FAM-2", "Ayesha", "Khan", "FEMALE");
    const parents = parentsFromParentLinks([
      {
        childshipId: "c1",
        unionId: "u1",
        relationshipType: "BIOLOGICAL",
        partners: [father, mother],
      },
    ]);
    expect(parents).toHaveLength(2);
    expect(parents.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
  });

  it("builds a full bundle from mobile person details", () => {
    const father = person("p1", "FAM-1", "Hassan", "Khan", "MALE");
    const mother = person("p2", "FAM-2", "Ayesha", "Khan", "FEMALE");
    const focal = person("p3", "FAM-3", "Ali", "Khan", "MALE");
    const details = normalizeMobilePersonDetails({
      person: focal,
      parentLinks: [
        {
          childshipId: "c1",
          unionId: "u-parent",
          relationshipType: "BIOLOGICAL",
          partners: [father, mother],
        },
      ],
      unions: [],
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
    expect(bundle.member.id).toBe("p3");
    expect(bundle.parents).toHaveLength(2);
    expect(bundle.onlineDetails.person.familyCode).toBe("FAM-3");
  });

  it("preserves relative ids from cloud computed payload", () => {
    const uncle = {
      ...person("u-uncle", "FAM-9", "Omar", "Khan"),
      kinshipLabel: "Paternal uncle",
      side: "paternal" as const,
      degree: "full" as const,
    };
    const computed = computedRelationsFromMobile({
      fullSiblings: [],
      halfSiblings: [],
      paternalUncles: [uncle],
      paternalAunts: [],
      maternalUncles: [],
      maternalAunts: [],
    });
    expect(computed.paternalUncles[0]?.id).toBe("u-uncle");
    expect(computed.paternalUncles[0]?.kinshipLabel).toBe("Paternal uncle");
  });
});
