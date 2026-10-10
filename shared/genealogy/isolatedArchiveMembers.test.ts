import { listIsolatedArchiveMemberIds } from "./isolatedArchiveMembers";

describe("isolatedArchiveMembers", () => {
  it("lists people with no unions or child links", () => {
    const people = [
      { id: "a", firstName: "A" },
      { id: "b", firstName: "B" },
      { id: "c", firstName: "C" },
    ];
    const unions = [
      {
        partner1Id: "a",
        partner2Id: "b",
        childships: [{ childId: "c" }],
      },
    ];
    expect(listIsolatedArchiveMemberIds(people, unions)).toEqual([]);
  });

  it("flags standalone member", () => {
    const people = [{ id: "solo", firstName: "Solo" }];
    expect(listIsolatedArchiveMemberIds(people, [])).toEqual(["solo"]);
  });
});
