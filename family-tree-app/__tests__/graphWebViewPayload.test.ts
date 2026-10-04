import {
  buildPedigreeCanvasPayload,
  PEDIGREE_CARD_BIG_H,
  PEDIGREE_CARD_BIG_W,
} from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";
import { UNKNOWN_COPARENT_FAMILY_CODE } from "../../shared/unknownCoParent";

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

  it("emits marriage bands for each focal spouse", () => {
    const graph: FamilyGraph = {
      focalPersonId: "p1",
      focalPartnerIds: ["p2", "p3"],
      focalMarriageBands: [
        { partnerId: "p2", label: "Married 2000" },
        { partnerId: "p3", label: "Married 2010" },
      ],
      nodes: [
        {
          id: "p1",
          type: "person",
          position: { x: 0, y: 200 },
          data: {
            isFocal: true,
            person: {
              id: "p1",
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
        {
          id: "p2",
          type: "person",
          position: { x: 160, y: 200 },
          data: {
            person: {
              id: "p2",
              familyCode: "FAM-2",
              firstName: "Spouse",
              lastName: "A",
              gender: "FEMALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "p3",
          type: "person",
          position: { x: 320, y: 200 },
          data: {
            person: {
              id: "p3",
              familyCode: "FAM-3",
              firstName: "Spouse",
              lastName: "B",
              gender: "FEMALE",
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
    expect(payload.marriageBands?.length).toBe(2);
    expect(payload.marriageBands?.[0]?.label).toBe("Married 2000");
    expect(payload.marriageBands?.[1]?.label).toBe("Married 2010");
  });

  it("labels unknown co-parent placeholders on the canvas", () => {
    const graph: FamilyGraph = {
      focalPersonId: "child",
      nodes: [
        {
          id: "child",
          type: "person",
          position: { x: 0, y: 100 },
          data: {
            isFocal: true,
            person: {
              id: "child",
              familyCode: "FAM-CH",
              firstName: "Kid",
              lastName: "One",
              gender: "MALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "mom",
          type: "person",
          position: { x: 0, y: 0 },
          data: {
            person: {
              id: "mom",
              familyCode: "FAM-M",
              firstName: "Real",
              lastName: "Mom",
              gender: "FEMALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "unk",
          type: "person",
          position: { x: 120, y: 0 },
          data: {
            person: {
              id: "unk",
              familyCode: UNKNOWN_COPARENT_FAMILY_CODE.MALE,
              firstName: "__",
              lastName: "__",
              gender: "MALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
      ],
      edges: [
        { id: "p1", source: "mom", target: "child", type: "parent" },
        { id: "p2", source: "unk", target: "child", type: "parent" },
      ],
    };
    const payload = buildPedigreeCanvasPayload(graph);
    const unknownNode = payload.nodes.find((n) => n.id === "unk");
    expect(unknownNode?.label).toBe("Unknown");
    expect(unknownNode?.nameLine2).toBe("Parent");
    expect(unknownNode?.initials).toBe("?");
  });

  it("adds purple path highlight segments when path ids provided", () => {
    const graph: FamilyGraph = {
      focalPersonId: "p1",
      nodes: [
        {
          id: "p1",
          type: "person",
          position: { x: 0, y: 0 },
          data: {
            isFocal: true,
            person: {
              id: "p1",
              familyCode: "FAM-1",
              firstName: "A",
              lastName: "One",
              gender: "MALE",
              birthDate: null,
              deathDate: null,
              currentCity: null,
              isLiving: true,
            },
          },
        },
        {
          id: "p2",
          type: "person",
          position: { x: 200, y: 0 },
          data: {
            person: {
              id: "p2",
              familyCode: "FAM-2",
              firstName: "B",
              lastName: "Two",
              gender: "FEMALE",
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
    const payload = buildPedigreeCanvasPayload(graph, {
      pathHighlightPersonIds: ["p1", "p2"],
      highlightPersonIds: ["p1", "p2"],
    });
    expect(payload.highlightSegments?.length).toBeGreaterThan(0);
    expect(payload.highlightSegments?.[0]?.color).toBe("#7828A0");
    expect(payload.highlightSegments?.[0]?.strokeWidth).toBe(6);
  });
});
