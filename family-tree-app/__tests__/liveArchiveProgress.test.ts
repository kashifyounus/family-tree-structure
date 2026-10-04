import {
  evaluateLiveArchiveProgress,
  estimateGenerationSpan,
} from "@/lib/archive/liveArchiveProgress";

jest.mock("@/lib/db/database", () => ({
  getDatabase: () => ({
    getFirstSync: () => ({ count: 0 }),
  }),
}));

jest.mock("@/lib/db/localRepository", () => ({
  getLocalUnionsForPerson: jest.fn(() => []),
}));

jest.mock("@/lib/db/parentDisplay", () => ({
  getParentNamesForPerson: jest.fn(() => ({
    fatherName: null,
    motherName: null,
  })),
}));

jest.mock("@/lib/db/kinshipLoader", () => ({
  loadKinshipDataset: () => ({ allUnions: [], peopleById: new Map() }),
}));

describe("evaluateLiveArchiveProgress", () => {
  it("marks checklist incomplete for focal-only archive", () => {
    const progress = evaluateLiveArchiveProgress("focal-1");
    expect(progress.checklistComplete).toBe(false);
    expect(progress.steps.find((s) => s.id === "spouse")?.done).toBe(false);
  });

  it("returns at least one generation for empty graph", () => {
    expect(estimateGenerationSpan("solo")).toBe(1);
  });
});
