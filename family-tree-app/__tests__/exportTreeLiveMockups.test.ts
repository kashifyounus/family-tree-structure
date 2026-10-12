import { writeTreeLiveMockupArtifacts } from "@/lib/marketing/exportTreeLiveMockups";

describe("exportTreeLiveMockups", () => {
  it("writes production canvas mockup artifacts when EXPORT_TREE_MOCKUP=1", () => {
    if (process.env.EXPORT_TREE_MOCKUP !== "1") return;
    writeTreeLiveMockupArtifacts();
    expect(true).toBe(true);
  });
});
