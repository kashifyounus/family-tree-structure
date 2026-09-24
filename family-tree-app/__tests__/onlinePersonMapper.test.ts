import type { OnlinePersonSummary } from "@/lib/api";
import {
  computedRelationsFromOnline,
  parentsFromOnlineParentLinks,
} from "@/lib/data/onlinePersonMapper";

function person(
  id: string,
  code: string,
  first: string,
  last: string,
  gender: "MALE" | "FEMALE" = "MALE",
): OnlinePersonSummary {
  return {
    id,
    familyCode: code,
    firstName: first,
    lastName: last,
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    occupation: null,
    bio: null,
    isLiving: true,
    age: null,
  };
}

describe("onlinePersonMapper", () => {
  it("maps parent links to unique kinship parents", () => {
    const father = person("p1", "FAM-1", "Hassan", "Khan", "MALE");
    const mother = person("p2", "FAM-2", "Ayesha", "Khan", "FEMALE");
    const parents = parentsFromOnlineParentLinks([
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

  it("preserves relative ids from cloud computed payload", () => {
    const uncle = {
      ...person("u-uncle", "FAM-9", "Omar", "Khan"),
      kinshipLabel: "Paternal uncle",
      side: "paternal" as const,
      degree: "full" as const,
    };
    const computed = computedRelationsFromOnline({
      fullSiblings: [],
      halfSiblings: [],
      paternalUncles: [uncle],
      paternalAunts: [],
      maternalUncles: [],
      maternalAunts: [],
    });
    expect(computed?.paternalUncles[0]?.id).toBe("u-uncle");
    expect(computed?.paternalUncles[0]?.kinshipLabel).toBe("Paternal uncle");
  });
});
