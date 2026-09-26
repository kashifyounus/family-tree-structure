import {
  filterArchivePeople,
  matchesArchiveQuery,
  type ArchiveQuery,
} from "./archiveQuery";

describe("archiveQuery", () => {
  const sample = [
    {
      gender: "MALE",
      deathDate: null,
      currentCity: "Karachi",
      nickname: "Kay",
    },
    {
      gender: "FEMALE",
      deathDate: "2020-01-01",
      currentCity: "Lahore",
      nickname: null,
    },
  ];

  it("matches empty AND as pass-through", () => {
    const q: ArchiveQuery = { and: [] };
    expect(matchesArchiveQuery(sample[0], q)).toBe(true);
  });

  it("requires all AND clauses", () => {
    const q: ArchiveQuery = {
      and: [
        { field: "gender", value: "male" },
        { field: "living", value: "true" },
        { field: "currentCity", value: "Karachi" },
      ],
    };
    expect(matchesArchiveQuery(sample[0], q)).toBe(true);
    expect(matchesArchiveQuery(sample[1], q)).toBe(false);
  });

  it("filters lists", () => {
    const q: ArchiveQuery = { and: [{ field: "living", value: "true" }] };
    expect(filterArchivePeople(sample, q)).toHaveLength(1);
  });
});
