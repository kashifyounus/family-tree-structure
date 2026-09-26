import {
  buildKinshipAdjacency,
  enumeratePathsOnGraph,
  summarizeKinshipSteps,
} from "@/lib/kinship/relationPaths";
import type { KinshipPerson, KinshipUnionRecord } from "@/lib/kinship/types";

function person(id: string, gender: "MALE" | "FEMALE" = "MALE"): KinshipPerson {
  return {
    id,
    familyCode: `FAM-${id}`,
    firstName: id,
    lastName: "Test",
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender,
    birthDate: null,
    deathDate: null,
    currentCity: null,
    birthPlace: null,
    homeTown: null,
    occupation: null,
    bio: null,
  };
}

describe("relationPaths", () => {
  it("finds parent-child path", () => {
    const parent = person("parent", "MALE");
    const other = person("other", "FEMALE");
    const child = person("child");
    const people = [child, parent, other];
    const unions: KinshipUnionRecord[] = [
      {
        id: "u1",
        partner1Id: parent.id,
        partner2Id: other.id,
        partner1: parent,
        partner2: other,
        childships: [
          { childId: child.id, child, relationshipType: "BIOLOGICAL" },
        ],
      },
    ];
    const adj = buildKinshipAdjacency(people, unions);
    const { paths } = enumeratePathsOnGraph(adj, child.id, parent.id, { maxPaths: 10 });
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0][paths[0].length - 1].toId).toBe(parent.id);
  });

  it("summarizes steps with human label or fallback", () => {
    const byId = new Map([["a", person("a")], ["b", person("b", "FEMALE")]]);
    const steps = [{ fromId: "a", toId: "b", relation: "spouse" }];
    const label = summarizeKinshipSteps(steps, byId);
    expect(label.length).toBeGreaterThan(0);
  });
});
