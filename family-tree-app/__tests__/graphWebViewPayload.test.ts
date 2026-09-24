import type { FamilyGraph } from "@/lib/graph/types";

/** Mirrors GraphWebView payload shape for regression tests. */
function toCanvasPayload(graph: FamilyGraph) {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      familyCode: n.data.person.familyCode,
      label: `${n.data.person.firstName} ${n.data.person.lastName}`,
    })),
    edges: graph.edges.map((e) => ({ from: e.source, to: e.target })),
  };
}

describe("graph webview payload", () => {
  it("includes familyCode for node tap routing", () => {
    const graph: FamilyGraph = {
      focalPersonId: "p1",
      nodes: [
        {
          id: "p1",
          type: "person",
          position: { x: 0, y: 0 },
          data: {
            person: {
              id: "p1",
              familyCode: "FAM-10001",
              firstName: "Hassan",
              lastName: "Khan",
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
    const payload = toCanvasPayload(graph);
    expect(payload.nodes[0]?.familyCode).toBe("FAM-10001");
  });
});
