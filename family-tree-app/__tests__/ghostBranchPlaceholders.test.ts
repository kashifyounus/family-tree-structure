import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";

describe("ghost branch placeholders", () => {
  it("adds a faded ancestor ghost when parents are not fully expanded", () => {
    const graph: FamilyGraph = {
      focalPersonId: "ego",
      nodes: [
        {
          id: "ego",
          type: "person",
          position: { x: 0, y: 200 },
          data: {
            isFocal: true,
            hasUnexpandedParents: true,
            person: {
              id: "ego",
              familyCode: "FAM-1",
              firstName: "Ego",
              lastName: "One",
              gender: "MALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
      ],
      edges: [],
    };
    const payload = buildPedigreeCanvasPayload(graph);
    const ghost = payload.nodes.find((n) => n.id === "ghost-parents-ego");
    expect(ghost?.isGhost).toBe(true);
    expect(payload.segments.some((s) => s.id === "ghost-up-ego")).toBe(true);
  });
});
