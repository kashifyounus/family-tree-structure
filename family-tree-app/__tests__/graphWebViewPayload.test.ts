import {
  buildPedigreeCanvasPayload,
  PEDIGREE_CARD_BIG_H,
  PEDIGREE_CARD_BIG_W,
} from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";

describe("graph webview payload", () => {
  it("includes familyCode and layout positions for node tap routing", () => {
    const graph: FamilyGraph = {
      focalPersonId: "p1",
      nodes: [
        {
          id: "p1",
          type: "person",
          position: { x: 120, y: 200 },
          data: {
            isFocal: true,
            person: {
              id: "p1",
              familyCode: "FAM-10001",
              firstName: "Hassan",
              lastName: "Khan",
              gender: "MALE",
              birthDate: "1955-01-01",
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "p2",
          type: "person",
          position: { x: 340, y: 200 },
          data: {
            person: {
              id: "p2",
              familyCode: "FAM-10002",
              firstName: "Ayesha",
              lastName: "Khan",
              gender: "FEMALE",
              birthDate: "1960-03-02",
              deathDate: "2020-05-01",
              currentCity: null,
              isLiving: false,
            },
          },
        },
      ],
      edges: [
        {
          id: "s1",
          source: "p1",
          target: "p2",
          type: "spouse",
          label: "u1",
        },
      ],
    };
    const payload = buildPedigreeCanvasPayload(graph);
    expect(payload.nodes[0]?.familyCode).toBe("FAM-10001");
    expect(payload.nodes[0]?.x).toBe(120);
    expect(payload.nodes[0]?.w).toBe(PEDIGREE_CARD_BIG_W);
    expect(payload.nodes[0]?.h).toBe(PEDIGREE_CARD_BIG_H);
    expect(payload.nodes[0]?.years).toContain("1955");
    expect(payload.nodes[1]?.years).toContain("1960");
    expect(payload.segments.length).toBeGreaterThan(0);
    expect(payload.theme.canvas).toBe("#F6F1E7");
    expect(payload.theme.primary).toBe("#1B4332");
  });
});
