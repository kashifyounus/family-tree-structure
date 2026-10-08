import { layoutMarriageCentricGraph } from "../marriageTreeLayout";
import { placeRemainingIncludedPersons } from "./collateralTreePlacement";

describe("collateralTreePlacement", () => {
  it("places cousins beside their parent row instead of stacking on one point", () => {
    const unions = [
      {
        id: "u1",
        partner1Id: "ego",
        partner2Id: "spouse",
        childships: [],
      },
      {
        id: "u2",
        partner1Id: "dad",
        partner2Id: "mom",
        childships: [{ childId: "ego" }, { childId: "uncle" }],
      },
      {
        id: "u3",
        partner1Id: "uncle",
        partner2Id: "aunt",
        childships: [{ childId: "cousin1" }],
      },
    ];
    const people = new Map(
      ["ego", "spouse", "dad", "mom", "uncle", "aunt", "cousin1"].map(
        (id) => [id, { id, birthDate: "1980-01-01", gender: "MALE" as const }],
      ),
    );
    const included = new Set(people.keys());
    const layout = layoutMarriageCentricGraph(
      "ego",
      people,
      unions,
      included,
      0,
      0,
      { phoneSingleParentSide: false, maxAncestorGenerations: 2 },
    );
    const positions = layout.positions;
    const edges = [...layout.edges];
    placeRemainingIncludedPersons(
      positions,
      edges,
      included,
      unions,
      people,
      0,
      "ego",
      ["spouse"],
    );
    const c1 = positions.get("cousin1");
    const uncle = positions.get("uncle");
    expect(c1).toBeDefined();
    expect(uncle).toBeDefined();
    expect(c1!.x).not.toBe(uncle!.x);
    expect(c1!.y).toBeGreaterThan(uncle!.y);
  });
});
