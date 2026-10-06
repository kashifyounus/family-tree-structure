import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";
import { PEDIGREE_BAND_COLORS } from "../../shared/pedigreeBandTheme";

function minimalPerson(
  id: string,
  familyCode: string,
  x: number,
  y: number,
  opts?: { isFocal?: boolean },
) {
  return {
    id,
    type: "person" as const,
    position: { x, y },
    data: {
      isFocal: opts?.isFocal,
      person: {
        id,
        familyCode,
        firstName: "Test",
        lastName: "Person",
        gender: "MALE" as const,
        birthDate: "1990-01-01",
        deathDate: null,
        currentCity: null,
        isLiving: true,
      },
    },
  };
}

describe("cousin-network pedigree presentation", () => {
  it("colors grandparent row as gp band", () => {
    const graph: FamilyGraph = {
      focalPersonId: "ego",
      nodes: [
        minimalPerson("gpa", "FAM-1", 0, 0),
        minimalPerson("ego", "FAM-2", 0, 120, { isFocal: true }),
      ],
      edges: [{ id: "e1", source: "gpa", target: "ego", type: "parent" }],
    };
    const payload = buildPedigreeCanvasPayload(graph);
    const gpa = payload.nodes.find((n) => n.id === "gpa");
    expect(gpa?.visualBand).toBe("gp");
    expect(gpa?.bandColor).toBe(PEDIGREE_BAND_COLORS.gp);
  });
});
